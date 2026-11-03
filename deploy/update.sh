#!/usr/bin/env bash
# Descarga la última imagen y recrea el contenedor solo si ha cambiado.
# Lo ejecuta el timer de systemd (mcouso-web-update.timer) cada 5 minutos.
set -euo pipefail
cd "$(dirname "$0")/.."

before=$(docker image inspect -f '{{.Id}}' ghcr.io/mateocouso94/mcouso-web:latest 2>/dev/null || echo none)
docker compose pull --quiet portfolio
after=$(docker image inspect -f '{{.Id}}' ghcr.io/mateocouso94/mcouso-web:latest)

if [[ "$before" != "$after" ]]; then
  echo "Nueva imagen: ${after:7:12} (antes ${before:7:12}). Desplegando..."
  docker compose up -d --no-build portfolio
  docker image prune -f >/dev/null
else
  echo "Sin cambios."
fi
