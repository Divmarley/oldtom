# Deploy Old Toms to a server over SSH

This guide runs the prebuilt Docker Hub images on a Linux server. The server
does not build the React or Django source code.

| Service | Image | Public port | Persistent data |
| --- | --- | --- | --- |
| Nginx | `nginx:alpine` | `${HTTP_PORT:-80}`, `${HTTPS_PORT:-443}` | Let's Encrypt volume |
| Frontend | `marleyk/oldtoms:frontend-latest` | Internal only | — |
| Backend | `marleyk/oldtoms:backend-latest` | Internal only | Static and media volumes |
| MySQL | `mysql:8.0` | Internal only | MySQL volume |
| phpMyAdmin | `phpmyadmin:5.2.3` | Port 8080 when enabled | — |

The backend and frontend images support both `linux/amd64` and `linux/arm64`.

## 1. Server prerequisites

The server needs:

- SSH access.
- Git, unless the runtime files are copied with `scp`.
- Docker Engine and the Docker Compose v2 plugin.
- Port 22 for SSH plus public ports 80 and 443. Let's Encrypt uses port 80 to
  validate the domain and Nginx serves the application on port 443.

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

First, create the destinations while connected through SSH:

```sh
install -d -m 0755 /opt/oldtom/app/nginx /opt/oldtom/app/systemd
```

Run these commands from the project directory on your computer, not inside the
server's SSH session:

```sh
scp docker-compose.yml docker-compose.production.yml .env.example \
  root@104.248.165.208:/opt/oldtom/app/
scp nginx/nginx.conf nginx/default.conf nginx/https.conf.template \
  nginx/security-headers.conf \
  root@104.248.165.208:/opt/oldtom/app/nginx/
scp systemd/oldtom-certbot-renew.service systemd/oldtom-certbot-renew.timer \
  root@104.248.165.208:/opt/oldtom/app/systemd/
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
- `DOMAIN`: the primary public hostname. It must have a public DNS `A` and/or
  `AAAA` record pointing to this server. Set `ADDITIONAL_DOMAINS` only for
  extra names, such as `www.example.com`, that also resolve here.
- `CERTBOT_EMAIL`: an address that can receive Let's Encrypt expiry notices.
- `HTTP_PORT` and `HTTPS_PORT`: keep their direct-TLS defaults of `80` and
  `443`. HTTP-01 validation only reaches public port 80; use different host
  ports only when a separate gateway forwards public ports 80 and 443 to them.
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

### HTTPS at Nginx

The production Compose override terminates TLS in Nginx. It redirects
application traffic from HTTP to HTTPS, serves ACME challenges on port 80, and
obtains its certificate with the included Certbot one-off services. Keep these
settings enabled:

```dotenv
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
SECURE_SSL_REDIRECT=true
```

Nginx is the single owner of the public HSTS response. Set
`HSTS_HEADER_VALUE=max-age=31536000` initially. Add
`; includeSubDomains; preload` only after every subdomain is permanently HTTPS
and meets browser preload requirements. Keep the Django `SECURE_HSTS_*`
settings at their example values so it does not emit a competing header.

Use the same HTTPS origin in `CSRF_TRUSTED_ORIGINS`,
`CORS_ALLOWED_ORIGINS`, `SITE_URL`, and `EMAIL_LOGO_URL`. The provided
example values cover both `example.com` and `www.example.com`; remove the
`www` values if it is not configured as an additional domain.

The direct TLS Nginx configuration sets `X-Forwarded-Proto` itself, so
`TRUSTED_PROXY_COUNT=1` is correct for this deployment. If a CDN or load
balancer is added later, configure it to connect to Nginx over HTTPS and do
not increase `TRUSTED_PROXY_COUNT` until the server firewall/security group
allows origin traffic only from that provider's IP ranges. Otherwise a direct
client can forge forwarded-address headers used by throttling.

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
The production override also defaults the container environment file to
`/opt/oldtom/oldtom.env`; `APP_ENV_FILE` lets you use a different location.

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

Before the first start, make sure every configured hostname resolves to this
server and that nothing else is listening on port 80. Obtain the initial
certificate while Nginx is stopped:

```sh
dc config --quiet
dc stop nginx
dc --profile certbot pull certbot-init
dc --profile certbot run --rm --service-ports certbot-init
```

Then pull the application images and start the stack:

```sh
dc pull
dc up -d --no-build --remove-orphans --wait --wait-timeout 180
dc exec -T nginx nginx -t
dc --profile certbot run --rm certbot-configure-renewal
```

On first startup the backend automatically runs Django migrations and
`collectstatic` before Gunicorn starts.

Verify the deployment:

```sh
dc ps
dc logs --tail=200 backend nginx
dc exec -T backend python manage.py migrate --check
curl -kfsS https://127.0.0.1/health
```

From your computer, verify the redirect and the browser-trusted certificate:

```sh
curl -sSI http://YOUR_DOMAIN/
curl -fsS https://YOUR_DOMAIN/health
```

Create the first Django administrator if needed:

```sh
dc exec backend python manage.py createsuperuser
```

### Configure celebration registration verification

In Django admin, add the approved institutions under **Schools** with the
`Sister school` kind. Only active sister schools appear in the public event
registration form; unlisted institutions can still register through the
`Other school` option.

Add official old-student records under **Alumni roster entries**. Each record
needs a year batch and either a verified email address or official alumni ID.
This roster is intentionally separate from public alumni profiles, because a
visitor can create a profile themselves. An event registration is marked as a
database match only when its email, year batch, and supplied alumni ID (when
present) match an active roster record. A match never approves attendance by
itself: every registration remains pending until an administrator approves it.

After importing or correcting roster data, select the affected registrations
in Django admin and run **Recheck selected registrations against the roster**.

### Renew certificates

The initial setup changes the certificate to use Nginx's ACME webroot, so this
command can renew it without stopping the application. First validate the
renewal path against Let's Encrypt's staging service:

```sh
dc --profile certbot run --rm certbot-renew renew --dry-run --non-interactive
```

Install the included systemd timer on the server. It renews twice daily and
reloads Nginx only after the Certbot command succeeds:

```sh
sudo install -m 0644 systemd/oldtom-certbot-renew.service \
  /etc/systemd/system/oldtom-certbot-renew.service
sudo install -m 0644 systemd/oldtom-certbot-renew.timer \
  /etc/systemd/system/oldtom-certbot-renew.timer
sudo systemctl daemon-reload
sudo systemctl enable --now oldtom-certbot-renew.timer
sudo systemctl start oldtom-certbot-renew.service
sudo systemctl status oldtom-certbot-renew.timer
```

The unit assumes the documented `/opt/oldtom/app` and
`/opt/oldtom/oldtom.env` paths. If Docker is not at `/usr/bin/docker`, replace
that path in the service file before installing it.

### Change certificate names

For an added or removed `ADDITIONAL_DOMAINS` name, first update its DNS record
and the related Django origins in the environment file. Leave Nginx running,
then reissue the existing certificate and recreate Nginx so it loads the
updated hostname list:

```sh
dc --profile certbot run --rm certbot-update-domains
dc up -d --no-build --no-deps --force-recreate --wait --wait-timeout 60 nginx
```

For a new primary `DOMAIN`, update DNS and all public-origin settings, stop
Nginx, rerun `certbot-init`, start Nginx, and run
`certbot-configure-renewal` again. Do not delete the certificate volume; old
lineages can remain there safely until they are deliberately removed with
Certbot.

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
curl -kfsS https://127.0.0.1/health
```

Do not run `docker compose down -v`; `-v` deletes the persistent database,
uploaded-media, and Let's Encrypt certificate volumes.

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

## 8. Open phpMyAdmin

phpMyAdmin is disabled by default and binds only to the server's loopback
address when enabled. This is the recommended configuration.

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

To intentionally publish phpMyAdmin on the live server, set these values in the
server environment before recreating it:

```dotenv
PHPMYADMIN_BIND_IP=0.0.0.0
PHPMYADMIN_PORT=8080
```

It will then be available at `http://SERVER_IP:8080`. This exposes a sensitive
database administration page to the internet; use strong credentials and
prefer a firewall source-IP allowlist. Never expose ports 3306 or 8000.

## Troubleshooting

- `pull access denied`: run `docker login --username marleyk` using a Docker
  Hub token that can read the repository.
- Backend is unhealthy: run `dc logs --tail=200 backend mysql`; confirm database
  passwords match and `ALLOWED_HOSTS` contains `localhost`.
- Nginx returns `502`: run `dc restart nginx` after backend/frontend containers
  have started.
- Nginx cannot load its certificate: confirm `DOMAIN` matches the initial
  certificate name, port 80 is publicly reachable, stop Nginx, then rerun
  `dc --profile certbot run --rm --service-ports certbot-init` while Nginx is
  stopped.
- Certificate renewal fails: make sure `certbot-configure-renewal` completed
  after the first start and that `/.well-known/acme-challenge/` is reachable on
  HTTP.
- Check all services continuously with `dc logs -f --tail=200`.
