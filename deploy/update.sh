#!/usr/bin/env bash
# Mantiene mcouso.es al día. Lo ejecuta el timer de systemd (mcouso-web-update.timer) cada 5 minutos:
#   1. git pull: trae cambios de compose.yaml, de este script, etc.
#   2. docker compose pull: descarga la imagen nueva si la hay.
#   3. Si ha cambiado algo de lo anterior, recrea el contenedor.
#   4. Avisa a Uptime Kuma (monitor Push) de cómo ha ido, si KUMA_PUSH_URL está en .env.
#      Si el script falla, avisa con estado "down"; si deja de ejecutarse, Kuma
#      avisa solo cuando pasa el intervalo sin recibir nada.
set -euo pipefail
cd "$(dirname "$0")/.."
IMAGE=ghcr.io/mateocouso94/mcouso-web:latest

# URL del monitor Push de Kuma, sin parámetros: KUMA_PUSH_URL=http://IP:3001/api/push/<token>
KUMA_PUSH_URL=$(grep -E '^KUMA_PUSH_URL=' .env 2>/dev/null | head -n1 | cut -d= -f2- | sed 's/[?].*$//' || true)

push() { # push <up|down> <mensaje>
  [[ -n "$KUMA_PUSH_URL" ]] || return 0
  curl -fsS -m 10 -o /dev/null --get "$KUMA_PUSH_URL" \
    --data-urlencode "status=$1" --data-urlencode "msg=$2" --data-urlencode "ping=" \
    || echo "Aviso: no se pudo avisar a Uptime Kuma."
}
trap 'push down "update.sh falló en la línea $LINENO: $BASH_COMMAND"' ERR

rev_before=$(git rev-parse HEAD)
if ! git pull --ff-only --quiet; then
  echo "Aviso: git pull ha fallado; sigo con la imagen."
  pull_warn=" (git pull falló)"
fi
rev_after=$(git rev-parse HEAD)

img_before=$(docker image inspect -f '{{.Id}}' "$IMAGE" 2>/dev/null || echo none)
docker compose pull --quiet portfolio
img_after=$(docker image inspect -f '{{.Id}}' "$IMAGE")

if [[ "$img_before" != "$img_after" || "$rev_before" != "$rev_after" ]]; then
  echo "Desplegando: imagen ${img_after:7:12} (antes ${img_before:7:12}), repo ${rev_after:0:7} (antes ${rev_before:0:7})"
  docker compose up -d --no-build portfolio
  docker image prune -f >/dev/null
  push up "Desplegado ${rev_after:0:7}${pull_warn:-}"
else
  echo "Sin cambios."
  push up "Sin cambios${pull_warn:-}"
fi
