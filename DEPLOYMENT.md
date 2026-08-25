# Deploy Old Toms to a server over SSH

This guide runs the prebuilt Docker Hub images on a Linux server. The server
does not build the React or Django source code.

| Service | Image | Public port | Persistent data |
| --- | --- | --- | --- |
| Nginx | `nginx:alpine` | `${HTTP_PORT:-80}` | — |
| Frontend | `marleyk/oldtoms:frontend-latest` | Internal only | — |
| Backend | `marleyk/oldtoms:backend-latest` | Internal only | Static and media volumes |
| MySQL | `mysql:8.0` | Internal only | MySQL volume |
| phpMyAdmin | `phpmyadmin:5.2.3` | SSH tunnel only | — |

The backend and frontend images support both `linux/amd64` and `linux/arm64`.

## 1. Server prerequisites

The server needs:

- SSH access.
- Git, unless the runtime files are copied with `scp`.
- Docker Engine and the Docker Compose v2 plugin.
- Port 22 for SSH and port 80 for this stack. Open port 443 at the TLS proxy
  when HTTPS is configured.

Connect from your computer:

```sh
ssh root@104.248.165.208
```

Check Docker on the server:

```sh
docker --version
docker compose version
```

Install Docker from the [official Docker Engine instructions](https://docs.docker.com/engine/install/)
if either command is missing. If Docker requires root on the server, add
`sudo` before each Docker command in this guide.

## 2. Put the runtime files on the server

Create a stable base directory while connected through SSH:

```sh
sudo install -d -m 0755 -o "$USER" -g "$USER" /opt/oldtom
```

Use either Git or `scp`.

### Option A: Git

Use this only after the deployment files in this revision have been committed
and pushed, and after the tracked `.env` file has been removed from Git and its
credentials rotated:

```sh
git clone https://github.com/Divmarley/oldtom.git /opt/oldtom/app
cd /opt/oldtom/app
```

If it is already cloned:

```sh
cd /opt/oldtom/app
git pull --ff-only
```

### Option B: copy only the runtime files

First, create the destination while connected through SSH:

```sh
install -d -m 0755 /opt/oldtom/app/nginx
```

Run these commands from the project directory on your computer, not inside the
server's SSH session:

```sh
scp docker-compose.yml docker-compose.production.yml .env.example \
  root@104.248.165.208:/opt/oldtom/app/
scp nginx/nginx.conf nginx/default.conf \
  root@104.248.165.208:/opt/oldtom/app/nginx/
```

## 3. Create the production environment file

Run on the server:

```sh
test -f /opt/oldtom/oldtom.env || \
  cp /opt/oldtom/app/.env.example /opt/oldtom/oldtom.env
chmod 600 /opt/oldtom/oldtom.env
nano /opt/oldtom/oldtom.env
```

Replace every `replace-with-*` value. At minimum, check:

- `SECRET_KEY`: generate a value with `openssl rand -hex 48`.
- `ALLOWED_HOSTS`: include the domain names and `localhost`. The latter is
  required by the backend container health check.
- `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS`, `SITE_URL`, and
  `EMAIL_LOGO_URL`: use complete URLs with `http://` or `https://` where shown
  in `.env.example`.
- `DB_PASSWORD` and `MYSQL_ROOT_PASSWORD`: use different strong passwords.
- All SMTP settings before enabling real welcome and login emails.

Do not copy the repository's `.env` file to the server. It is still tracked by
Git and may contain exposed credentials. Remove it from Git history/tracking
and rotate any credential that was previously committed.

If SMTP is not ready yet, temporarily use:

```dotenv
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Messages will appear in backend logs instead of being delivered.

### HTTPS or direct HTTP

The included Nginx configuration listens on HTTP port 80. For production,
terminate HTTPS at a trusted load balancer, CDN, Caddy, or another TLS proxy,
then keep these settings enabled:

```dotenv
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
SECURE_SSL_REDIRECT=true
```

The outer proxy must forward the original `X-Forwarded-Proto` value. Set
`TRUSTED_PROXY_COUNT=2` when an external proxy sits in front of the included
Nginx container; otherwise use `1`.

For a temporary direct-IP HTTP test only, use values similar to:

```dotenv
ALLOWED_HOSTS=104.248.165.208,localhost
CSRF_TRUSTED_ORIGINS=http://104.248.165.208
CORS_ALLOWED_ORIGINS=http://104.248.165.208
SITE_URL=http://104.248.165.208
SESSION_COOKIE_SECURE=false
CSRF_COOKIE_SECURE=false
SECURE_SSL_REDIRECT=false
SECURE_HSTS_SECONDS=0
```

Replace `104.248.165.208` with the server's public IP.

## 4. Sign in to Docker Hub when required

Public images can be pulled without signing in. For a private repository, use
a read-only Docker Hub access token when prompted:

```sh
docker login --username marleyk
```

Do not put the token directly in a command or save it in this file.

## 5. Pull and start the application

Run the following setup after each new SSH login. The fixed project name keeps
the same MySQL and media volumes even if the working directory changes.

```sh
cd /opt/oldtom/app
export APP_ENV_FILE=/opt/oldtom/oldtom.env

dc() {
  docker compose \
    --project-name oldtom \
    --env-file "$APP_ENV_FILE" \
    -f docker-compose.yml \
    -f docker-compose.production.yml \
    "$@"
}
```

Validate the Compose configuration without printing resolved secrets, pull the
images, and start the stack:

```sh
dc config --quiet
dc pull
dc up -d --no-build --remove-orphans --wait --wait-timeout 180
dc restart nginx
```

On first startup the backend automatically runs Django migrations and
`collectstatic` before Gunicorn starts.

Verify the deployment:

```sh
dc ps
dc logs --tail=200 backend nginx
dc exec -T backend python manage.py migrate --check
curl -fsS http://127.0.0.1/health
```

For a domain behind HTTPS, also verify it from your computer:

```sh
curl -fsS https://YOUR_DOMAIN/health
```

Create the first Django administrator if needed:

```sh
dc exec backend python manage.py createsuperuser
```

## 6. Update to newly pushed images

SSH into the server, recreate the `dc` function from section 5, then back up
the database and uploaded media before running migrations:

```sh
install -d -m 0700 /opt/oldtom/backups
stamp=$(date -u +%Y%m%dT%H%M%SZ)

dc exec -T mysql sh -c \
  'exec mysqldump --single-transaction --quick --routines --triggers -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  > "/opt/oldtom/backups/mysql-$stamp.sql"

dc exec -T nginx tar -czf - -C /app/media . \
  > "/opt/oldtom/backups/media-$stamp.tar.gz"

test -s "/opt/oldtom/backups/mysql-$stamp.sql"
test -s "/opt/oldtom/backups/media-$stamp.tar.gz"
```

Pull and deploy only the application images:

```sh
dc pull backend frontend
dc up -d --no-build --force-recreate --wait --wait-timeout 180 backend frontend
dc up -d --no-build --no-deps --force-recreate --wait --wait-timeout 60 nginx
dc ps
dc exec -T backend python manage.py migrate --check
curl -fsS http://127.0.0.1/health
```

Do not run `docker compose down -v`; `-v` deletes the persistent database and
uploaded-media volumes.

## 7. Pin or roll back an image release

The `latest` tags move whenever a new image is pushed. For a repeatable release,
set `BACKEND_IMAGE` and `FRONTEND_IMAGE` in `/opt/oldtom/oldtom.env` to version
tags or manifest digests.

The images published on 25 August 2026 can be pinned with:

```dotenv
BACKEND_IMAGE=marleyk/oldtoms@sha256:73d6bf145db6769d27b310ddc692d7e5cf862a02ed7cf61d359be4f7bc2fd5f6
FRONTEND_IMAGE=marleyk/oldtoms@sha256:58d8f4eb6f3bd0f66573df47be0dd7aafb42fd02cbe0f969091666068c39d3fc
```

To roll back, restore the previous image values and, when required by a
database migration, restore the matching database backup. Then run:

```sh
dc pull backend frontend
dc up -d --no-build --force-recreate --wait --wait-timeout 180 backend frontend
dc up -d --no-build --no-deps --force-recreate --wait --wait-timeout 60 nginx
```

## 8. Open phpMyAdmin through an SSH tunnel

phpMyAdmin is disabled by default and binds only to the server's loopback
address when enabled.

Start it on the server:

```sh
dc --profile tools up -d phpmyadmin
```

Keep an SSH tunnel open from your computer:

```sh
ssh -N -L 8080:127.0.0.1:8080 root@104.248.165.208
```

Open `http://localhost:8080` locally. The MySQL host inside phpMyAdmin is
`mysql`. Stop phpMyAdmin when finished:

```sh
dc --profile tools stop phpmyadmin
```

Do not expose ports 3306, 8000, or 8080 in the server firewall.

## Troubleshooting

- `pull access denied`: run `docker login --username marleyk` using a Docker
  Hub token that can read the repository.
- Backend is unhealthy: run `dc logs --tail=200 backend mysql`; confirm database
  passwords match and `ALLOWED_HOSTS` contains `localhost`.
- Nginx returns `502`: run `dc restart nginx` after backend/frontend containers
  have started.
- Repeated HTTP/HTTPS redirects: confirm the TLS proxy forwards
  `X-Forwarded-Proto: https`, or disable `SECURE_SSL_REDIRECT` only while using
  temporary direct HTTP.
- Check all services continuously with `dc logs -f --tail=200`.
