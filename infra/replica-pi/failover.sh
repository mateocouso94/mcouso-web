#!/usr/bin/env bash
# Decide si la Pi sirve mcouso.es. Lo ejecuta mcouso-replica-failover.timer cada minuto.
#
# Pregunta a la API de Cloudflare qué conectores tiene vivos el túnel:
#   - Si el de homelab (HOMELAB_ARCH) falta TAKEOVER_AFTER minutos seguidos → arranca cloudflared aquí.
#   - Si vuelve y aguanta RELEASE_AFTER minutos seguidos → para cloudflared aquí.
#   - Si la API no responde (p. ej. se cae internet aquí), no cambia nada.
# No hay ninguna conexión entre las dos casas: solo la Pi hablando con Cloudflare.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

STATE_DIR=/run/mcouso-replica   # tmpfs: no escribe en la microSD
mkdir -p "$STATE_DIR"
STATE="$STATE_DIR/counters"   # "<minutos sin homelab> <minutos con homelab>"

account=$(env_get CF_ACCOUNT_ID); tunnel=$(env_get CF_TUNNEL_ID); token=$(env_get CF_API_TOKEN)
homelab_arch=$(env_get HOMELAB_ARCH linux_amd64)
takeover_after=$(env_get TAKEOVER_AFTER 3); release_after=$(env_get RELEASE_AFTER 5)
[[ -n "$account" && -n "$tunnel" && -n "$token" ]] || { echo "Faltan CF_ACCOUNT_ID, CF_TUNNEL_ID o CF_API_TOKEN en .env"; exit 1; }

# 1. ¿Está conectado el cloudflared de homelab?
if ! resp=$(curl -fsS -m 15 -H "Authorization: Bearer $token" \
     "https://api.cloudflare.com/client/v4/accounts/$account/cfd_tunnel/$tunnel/connections"); then
  echo "API de Cloudflare sin respuesta; no cambio nada."
  exit 0
fi
if [[ $(jq -r '.success' <<<"$resp") != "true" ]]; then
  echo "La API devolvió error: $(jq -c '.errors' <<<"$resp"); no cambio nada."
  exit 0
fi
homelab_conns=$(jq --arg a "$homelab_arch" '[.result[] | select(.arch == $a) | (.conns // [])[]] | length' <<<"$resp")

# 2. Contadores con histéresis, para no ir y volver por un corte de segundos.
read -r down up 2>/dev/null < "$STATE" || { down=0; up=0; }
if (( homelab_conns > 0 )); then down=0; up=$((up + 1)); else up=0; down=$((down + 1)); fi
echo "$down $up" > "$STATE"

# 3. Estado actual de la réplica y acción.
active=false
[[ $(docker inspect -f '{{.State.Running}}' mcouso-cloudflared 2>/dev/null) == "true" ]] && active=true

if ! $active && (( down >= takeover_after )); then
  compose up -d portfolio
  compose --profile failover up -d cloudflared
  notify "homelab sin conexión desde hace ${down} min. Sirvo mcouso.es desde aquí."
elif $active && (( up >= release_after )); then
  compose --profile failover stop cloudflared
  notify "homelab vuelve a estar conectado (${up} min). Le devuelvo mcouso.es."
else
  echo "homelab: $homelab_conns conexiones · sin homelab ${down} min · con homelab ${up} min · réplica activa: $active"
fi
