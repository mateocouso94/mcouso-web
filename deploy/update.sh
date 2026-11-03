#!/usr/bin/env bash
# Mantiene mcouso.es al día. Lo ejecuta el timer de systemd (mcouso-web-update.timer) cada 5 minutos:
#   1. git pull: trae cambios de compose.yaml, de este script, etc.
#   2. docker compose pull: descarga la imagen nueva si la hay.
#   3. Si ha cambiado algo de lo anterior, recrea el contenedor.
set -euo pipefail
cd "$(dirname "$0")/.."
IMAGE=ghcr.io/mateocouso94/mcouso-web:latest

rev_before=$(git rev-parse HEAD)
git pull --ff-only --quiet || echo "Aviso: git pull ha fallado; sigo con la imagen."
rev_after=$(git rev-parse HEAD)

img_before=$(docker image inspect -f '{{.Id}}' "$IMAGE" 2>/dev/null || echo none)
docker compose pull --quiet portfolio
img_after=$(docker image inspect -f '{{.Id}}' "$IMAGE")

if [[ "$img_before" != "$img_after" || "$rev_before" != "$rev_after" ]]; then
  echo "Desplegando: imagen ${img_after:7:12} (antes ${img_before:7:12}), repo ${rev_after:0:7} (antes ${rev_before:0:7})"
  docker compose up -d --no-build portfolio
  docker image prune -f >/dev/null
else
  echo "Sin cambios."
fi
