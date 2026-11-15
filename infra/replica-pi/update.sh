#!/usr/bin/env bash
# Mantiene la réplica al día, igual que deploy/update.sh en homelab. Lo ejecuta
# mcouso-replica-update.timer cada 5 minutos: git pull + pull de la imagen + recrear si cambió.
# Solo toca el contenedor de la web; cloudflared lo gestiona failover.sh.
set -euo pipefail
source "$(dirname "$0")/lib.sh"
cd "$REPLICA_DIR/../.."
IMAGE=ghcr.io/mateocouso94/mcouso-web:latest
FAIL_FLAG=/run/mcouso-replica/update-failed
mkdir -p "$(dirname "$FAIL_FLAG")"

# Avisa una sola vez por fallo, no cada 5 minutos.
trap '[[ -e $FAIL_FLAG ]] || notify "update.sh falló en la línea $LINENO: $BASH_COMMAND"; touch "$FAIL_FLAG"' ERR

rev_before=$(git rev-parse HEAD)
git pull --ff-only --quiet || echo "Aviso: git pull ha fallado; sigo con la imagen."
rev_after=$(git rev-parse HEAD)

img_before=$(docker image inspect -f '{{.Id}}' "$IMAGE" 2>/dev/null || echo none)
compose pull --quiet portfolio
img_after=$(docker image inspect -f '{{.Id}}' "$IMAGE")

if [[ "$img_before" != "$img_after" || "$rev_before" != "$rev_after" ]]; then
  echo "Desplegando: imagen ${img_after:7:12}, repo ${rev_after:0:7}"
  compose up -d portfolio
  docker image prune -f >/dev/null
else
  echo "Sin cambios."
fi

if [[ -e $FAIL_FLAG ]]; then rm -f "$FAIL_FLAG"; notify "update.sh vuelve a funcionar."; fi
