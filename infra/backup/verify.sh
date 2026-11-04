#!/usr/bin/env bash
# El "0" de 3-2-1-0: comprueba que las copias se pueden recuperar, no solo que existen.
#
# En cada destino:
#   1. restic check --read-data-subset (lee y valida de verdad una parte de los datos)
#   2. Restaura el canario de la última copia y comprueba que es el que se escribió
#   3. Restaura los volcados SQLite y pasa PRAGMA integrity_check
# Resultado a Kuma (VERIFY_PUSH_URL): "up" si todo cuadra, "down" con el motivo si no.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
. ./lib.sh
load_conf
lock

errors=()
summary=()
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

for r in $(repos); do
  name=$(repo_name "$r"); log "== $name"
  if ! with_repo "$r" restic check --read-data-subset "$VERIFY_READ_SUBSET" >"$tmp/check.log" 2>&1; then
    errors+=("$name: restic check falla"); tail -n 10 "$tmp/check.log" >&2; continue
  fi
  dest="$tmp/$name"; mkdir -p "$dest"
  if ! with_repo "$r" restic restore latest --tag homelab --host "$(hostname)" \
         --target "$dest" --include "$DUMP_DIR" >"$tmp/restore.log" 2>&1; then
    errors+=("$name: no se puede restaurar"); tail -n 10 "$tmp/restore.log" >&2; continue
  fi
  got=$(cat "$dest$DUMP_DIR/canary.txt" 2>/dev/null || echo "")
  want=$(cat "$STATE_DIR/$name.canary" 2>/dev/null || echo "")
  if [[ -z "$want" || "$got" != "$want" ]]; then
    errors+=("$name: el canario restaurado no coincide"); continue
  fi
  dbs=0
  for f in "$dest$DUMP_DIR"/*.sqlite3; do
    [[ -e "$f" ]] || continue
    res=$(sqlite3 "$f" "PRAGMA integrity_check;" 2>&1 | head -n1)
    [[ "$res" == "ok" ]] || errors+=("$name: $(basename "$f") dañada ($res)")
    dbs=$((dbs + 1))
  done
  summary+=("$name OK ($dbs BD)")
  log "$name: check OK, canario OK, $dbs bases de datos íntegras"
done

if ((${#errors[@]})); then
  printf 'ERROR: %s\n' "${errors[@]}" >&2
  push "${VERIFY_PUSH_URL:-}" down "$(IFS='; '; echo "${errors[*]}" | cut -c1-200)"
  exit 1
fi
push "${VERIFY_PUSH_URL:-}" up "$(IFS=' · '; echo "${summary[*]}")"
log "Verificación correcta"
