#!/usr/bin/env bash
# Funciones comunes de las copias del homelab. Las usan backup.sh y verify.sh.
set -euo pipefail

CONF_DIR=${HOMELAB_BACKUP_CONF_DIR:-/etc/homelab-backup}
STATE_DIR=${HOMELAB_BACKUP_STATE_DIR:-/var/lib/homelab-backup}

log() { echo "[$(date '+%F %T')] $*"; }

load_conf() {
  [[ -r "$CONF_DIR/backup.conf" ]] || { echo "Falta $CONF_DIR/backup.conf (ver examples/backup.conf)" >&2; exit 2; }
  # shellcheck disable=SC1091
  . "$CONF_DIR/backup.conf"
  : "${BACKUP_PATHS:?BACKUP_PATHS vacío en backup.conf}"
  DUMP_DIR=${DUMP_DIR:-/var/backups/homelab-dumps}
  KEEP_DAILY=${KEEP_DAILY:-7}; KEEP_WEEKLY=${KEEP_WEEKLY:-4}; KEEP_MONTHLY=${KEEP_MONTHLY:-1}
  VERIFY_READ_SUBSET=${VERIFY_READ_SUBSET:-5%}
  mkdir -p "$STATE_DIR" "$DUMP_DIR"
}

# Lista de destinos: un fichero .env por repositorio en repos.d (local.env, b2.env...)
repos() { ls "$CONF_DIR"/repos.d/*.env 2>/dev/null || true; }
repo_name() { basename "$1" .env; }

# Ejecuta restic con las variables de un destino concreto, sin mezclarlas con el resto
with_repo() {
  local envfile=$1; shift
  ( set -a; . "$envfile"; set +a; "$@" )
}

# Lee una variable de un .env sin ejecutar nada más (para las URLs de Kuma)
env_get() { grep -E "^$2=" "$1" 2>/dev/null | head -n1 | cut -d= -f2- | sed 's/[?].*$//' || true; }

# Avisa a un monitor Push de Uptime Kuma: push <url> <up|down> <mensaje>
push() {
  local url=$1 status=$2 msg=$3
  [[ -n "$url" ]] || return 0
  curl -fsS -m 10 -o /dev/null --get "$url" \
    --data-urlencode "status=$status" --data-urlencode "msg=$msg" --data-urlencode "ping=" \
    || log "Aviso: no se pudo avisar a Uptime Kuma"
}

# Evita que dos ejecuciones se pisen
lock() { exec 9>"$STATE_DIR/lock"; flock -n 9 || { log "Ya hay una copia o verificación en marcha"; exit 0; }; }
