#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DOCKERHUB_USER=youruser ./scripts/push_images.sh
#   or
#   ./scripts/push_images.sh youruser

DOCKERHUB_USER=${1:-${DOCKERHUB_USER:-}}
if [ -z "$DOCKERHUB_USER" ]; then
  echo "Usage: DOCKERHUB_USER=youruser ./scripts/push_images.sh or ./scripts/push_images.sh youruser"
  exit 1
fi

TAG=${GIT_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}

echo "Building backend image..."
docker build -t ${DOCKERHUB_USER}/oldtom-backend:latest -t ${DOCKERHUB_USER}/oldtom-backend:${TAG} -f backend/Dockerfile ./backend

echo "Building frontend image..."
docker build -t ${DOCKERHUB_USER}/oldtom-frontend:latest -t ${DOCKERHUB_USER}/oldtom-frontend:${TAG} -f frontend/Dockerfile ./frontend

echo "Pushing backend images..."
docker push ${DOCKERHUB_USER}/oldtom-backend:latest
docker push ${DOCKERHUB_USER}/oldtom-backend:${TAG}

echo "Pushing frontend images..."
docker push ${DOCKERHUB_USER}/oldtom-frontend:latest
docker push ${DOCKERHUB_USER}/oldtom-frontend:${TAG}

echo "Done. Pushed images with tag: ${TAG}"
