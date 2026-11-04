#!/usr/bin/env bash
# Copia del homelab a todos los destinos configurados (3-2-1-0).
#
#   backup.sh          copia + retención en todos los destinos de repos.d/
#   backup.sh init     crea los repositorios que aún no existan
#
# Pasos de cada copia:
#   1. Volcados consistentes de las bases de datos SQLite (sin parar servicios) y scripts de pre.d/
#   2. Fichero "canario" con un valor aleatorio: verify.sh lo restaura y comprueba que coincide
#   3. restic backup + restic forget --prune con la retención de backup.conf, en cada destino
#   4. Aviso a Kuma (monitor Push del destino): "up" con el resumen o "down" con el error
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
. ./lib.sh
load_conf
lock

if [[ "${1:-}" == "init" ]]; then
  for r in $(repos); do
    if with_repo "$r" restic cat config >/dev/null 2>&1; then log "$(repo_name "$r"): ya existe"
    else log "$(repo_name "$r"): creando repositorio"; with_repo "$r" restic init; fi
  done
  exit 0
fi

# 1. Volcados de bases de datos
rm -f "$DUMP_DIR"/*.sqlite3
for db in ${SQLITE_DBS:-}; do
  [[ -f "$db" ]] || { log "Aviso: no existe $db, lo salto"; continue; }
  out="$DUMP_DIR/$(echo "${db#/}" | tr '/' '_').sqlite3"
  log "Volcando $db"
  sqlite3 "$db" ".timeout 10000" ".backup '$out'"
done
if [[ -d "$CONF_DIR/pre.d" ]]; then
  for hook in "$CONF_DIR"/pre.d/*.sh; do
    [[ -x "$hook" ]] || continue
    log "Ejecutando $(basename "$hook")"; DUMP_DIR="$DUMP_DIR" "$hook"
  done
fi

# 2. Canario
canary="$(hostname) $(date -Is) $(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')"
echo "$canary" > "$DUMP_DIR/canary.txt"

# 3 y 4. Copia en cada destino; un destino que falla no impide los demás
EXCLUDE_ARGS=(--exclude-caches)
for e in ${BACKUP_EXCLUDES:-}; do EXCLUDE_ARGS+=(--exclude "$e"); done
failed=0
for r in $(repos); do
  name=$(repo_name "$r"); url=$(env_get "$r" KUMA_PUSH_URL)
  log "== $name"
  start=$(date +%s)
  # shellcheck disable=SC2086
  if out=$(with_repo "$r" restic backup --no-scan --tag homelab --host "$(hostname)" \
             "${EXCLUDE_ARGS[@]}" $BACKUP_PATHS "$DUMP_DIR" 2>&1) &&
     out2=$(with_repo "$r" restic forget --prune --tag homelab --host "$(hostname)" \
             --keep-daily "$KEEP_DAILY" --keep-weekly "$KEEP_WEEKLY" --keep-monthly "$KEEP_MONTHLY" 2>&1); then
    echo "$out" | tail -n 4
    added=$(echo "$out" | grep -oE 'Added to the repository: .*' | sed 's/Added to the repository: //' || true)
    echo "$canary" > "$STATE_DIR/$name.canary"
    push "$url" up "OK en $(( $(date +%s) - start )) s${added:+ · +$added}"
  else
    failed=1
    err=$(printf '%s\n%s\n' "$out" "${out2:-}")
    echo "$err" | tail -n 20 >&2
    push "$url" down "Copia fallida: $(echo "$err" | grep -iE 'fatal|error' | tail -n1 | cut -c1-120)"
  fi
  out2=""
done
exit $failed
