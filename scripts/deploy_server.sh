#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy_server.sh <dockerhub_user> <remote_path>
DOCKERHUB_USER=marleyk
REMOTE_PATH=${2:-/opt/oldtom/app}

echo "Pulling latest images for ${DOCKERHUB_USER}..."
docker pull ${DOCKERHUB_USER}/oldtom-backend:latest
docker pull ${DOCKERHUB_USER}/oldtom-frontend:latest

echo "Updating on server path ${REMOTE_PATH}"
cd ${REMOTE_PATH}
docker compose --env-file ${REMOTE_PATH}/oldtom.env -f docker-compose.yml -f docker-compose.production.yml pull
docker compose --env-file ${REMOTE_PATH}/oldtom.env -f docker-compose.yml -f docker-compose.production.yml up -d --remove-orphans

echo "Deploy finished."
