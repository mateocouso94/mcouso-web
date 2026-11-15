# shellcheck shell=bash
# Funciones comunes de los scripts de la réplica. Se carga con "source".
REPLICA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$REPLICA_DIR/.env"

# Lee una variable del .env sin ejecutarlo: env_get NOMBRE [por defecto]
env_get() {
  local v
  v=$(grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)
  echo "${v:-${2:-}}"
}

compose() { docker compose -f "$REPLICA_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"; }

# Aviso por Telegram si está configurado; si no, solo al log.
notify() {
  echo "$1"
  local bot chat
  bot=$(env_get TELEGRAM_BOT_TOKEN); chat=$(env_get TELEGRAM_CHAT_ID)
  [[ -n "$bot" && -n "$chat" ]] || return 0
  curl -fsS -m 10 -o /dev/null "https://api.telegram.org/bot$bot/sendMessage" \
    --data-urlencode "chat_id=$chat" --data-urlencode "text=🍓 Réplica Pi: $1" \
    || echo "Aviso: no se pudo enviar el mensaje a Telegram."
}
