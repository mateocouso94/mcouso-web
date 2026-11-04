#!/usr/bin/env bash
# Prueba de extremo a extremo de las copias (la ejecuta GitHub Actions con restic real).
# Simula dos destinos (local y "nube"), un Uptime Kuma falso y fallos reales.
set -euo pipefail
HERE=$(cd "$(dirname "$0")/.." && pwd)
T=$(mktemp -d); trap 'kill $KUMA_PID 2>/dev/null || true; chmod -R u+w "$T" 2>/dev/null; rm -rf "$T"' EXIT
export HOMELAB_BACKUP_CONF_DIR=$T/conf HOMELAB_BACKUP_STATE_DIR=$T/state
mkdir -p "$T"/{conf/repos.d,state,data/app,dumps,repo-local,repo-nube}
pass() { echo "  ✓ $*"; }
fail() { echo "  ✗ $*"; exit 1; }

# Kuma falso: apunta cada push recibido
cat > "$T/kuma.py" <<'PY'
import http.server, sys, urllib.parse
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(s):
        u = urllib.parse.urlparse(s.path); q = urllib.parse.parse_qs(u.query)
        open(sys.argv[1], 'a').write(f"{u.path.split('/')[-1]} {q.get('status',[''])[0]} {q.get('msg',[''])[0]}\n")
        s.send_response(200); s.end_headers(); s.wfile.write(b'{"ok":true}')
    def log_message(*a): pass
http.server.HTTPServer(('127.0.0.1', 3901), H).serve_forever()
PY
python3 "$T/kuma.py" "$T/kuma.log" & KUMA_PID=$!; sleep 1
last_push() { grep "^$1 " "$T/kuma.log" | tail -n1; }

# Datos de ejemplo: ficheros y una base de datos SQLite "en uso"
echo "config importante" > "$T/data/app/config.yml"
head -c 2000000 /dev/urandom > "$T/data/app/blob.bin"
sqlite3 "$T/data/app/app.db" "CREATE TABLE t(x); INSERT INTO t VALUES ('hola'),('adios');"
mkdir -p "$T/data/cache"; printf "Signature: 8a477f597d28d172789f06886806bc55\n" > "$T/data/cache/CACHEDIR.TAG"; echo basura > "$T/data/app/x.tmp"; echo temporal > "$T/data/cache/descartable.bin"

echo secreto-de-prueba > "$T/conf/password"
cat > "$T/conf/backup.conf" <<CONF
BACKUP_PATHS="$T/data"
BACKUP_EXCLUDES="$T/data/**/*.tmp"
SQLITE_DBS="$T/data/app/app.db"
DUMP_DIR=$T/dumps
KEEP_DAILY=7; KEEP_WEEKLY=4; KEEP_MONTHLY=1
VERIFY_READ_SUBSET=100%
VERIFY_PUSH_URL=http://127.0.0.1:3901/api/push/verify?status=up&msg=OK&ping=
CONF
for r in local nube; do
  printf 'RESTIC_REPOSITORY=%s\nRESTIC_PASSWORD_FILE=%s\nKUMA_PUSH_URL=http://127.0.0.1:3901/api/push/%s\n' \
    "$T/repo-$r" "$T/conf/password" "$r" > "$T/conf/repos.d/$r.env"
done

echo "1. init"
"$HERE/backup.sh" init >/dev/null
[[ -f $T/repo-local/config && -f $T/repo-nube/config ]] && pass "los dos repositorios creados" || fail "init"
out=$("$HERE/backup.sh" init); grep -q "ya existe" <<<"$out" && pass "init es idempotente" || fail "init repetido"

echo "2. copia"
"$HERE/backup.sh" >/dev/null
last_push local | grep -q "^local up OK" && pass "aviso up del destino local: $(last_push local | cut -d' ' -f3-)" || fail "push local"
last_push nube  | grep -q "^nube up OK" && pass "aviso up del destino nube" || fail "push nube"
[[ -s $T/state/local.canary ]] && pass "canario registrado" || fail "canario"
snap() { RESTIC_PASSWORD_FILE=$T/conf/password restic -r "$T/repo-$1" "${@:2}"; }
LS=$(snap local ls latest)
grep -q "app/config.yml" <<<"$LS" && pass "config.yml está en la copia" || fail "falta config.yml"
grep -q "\.tmp$" <<<"$LS" && fail "x.tmp no debería copiarse" || pass "exclusiones aplicadas (*.tmp)"
grep -q "cache/descartable.bin" <<<"$LS" && fail "el contenido de la caché no debería copiarse" || pass "contenido de carpetas con CACHEDIR.TAG excluido"
grep -q "app.db.sqlite3" <<<"$LS" && pass "volcado SQLite incluido" || fail "falta volcado"

echo "3. retención"
echo "cambio" >> "$T/data/app/config.yml"; "$HERE/backup.sh" >/dev/null; "$HERE/backup.sh" >/dev/null
IDS=$(snap local snapshots --json | python3 -c "import sys,json;print(' '.join(s['short_id'] for s in sorted(json.load(sys.stdin),key=lambda s:s['time'])))")
read -r -a ids <<<"$IDS"
# restic >= 0.17: mientras no hay 7 días de copias, guarda también la más antigua; borra las intermedias
[[ ${#ids[@]} == 2 ]] || { snap local snapshots; fail "retención: ${#ids[@]} instantáneas (se esperaban 2)"; }
pass "3 copias el mismo día → la intermedia se borra (quedan la más antigua y la última)"

echo "4. verificación"
"$HERE/verify.sh" >/dev/null && last_push verify | grep -q "^verify up" && pass "verify OK: $(last_push verify | cut -d' ' -f3-)" || fail "verify"

echo "5. restauración real"
snap local restore latest --target "$T/restore" --include "$T/data/app" --include "$T/dumps" >/dev/null
cmp "$T/data/app/blob.bin" "$T/restore$T/data/app/blob.bin" && pass "fichero de 2 MB restaurado idéntico" || fail "restore"
sqlite3 "$T/restore$T/dumps/"*app.db.sqlite3 "SELECT count(*) FROM t;" | grep -q 2 && pass "base de datos restaurada con sus datos" || fail "BD"

echo "6. detecta un destino corrupto"
pack=$(find "$T/repo-nube/data" -type f | head -n1); chmod u+w "$pack"; echo "dañado" > "$pack"
if "$HERE/verify.sh" >/dev/null 2>&1; then fail "verify debería fallar"; fi
last_push verify | grep -q "^verify down .*nube" && pass "verify avisa down: $(last_push verify | cut -d' ' -f3-)" || fail "push down verify"

echo "7. un destino caído no impide el otro"
chmod -R u+w "$T/repo-nube"; rm -rf "$T/repo-nube"; mkdir "$T/repo-nube"   # repositorio desaparecido
if "$HERE/backup.sh" >/dev/null 2>&1; then fail "backup debería devolver error"; fi
last_push nube  | grep -q "^nube down" && pass "aviso down del destino caído: $(last_push nube | cut -d' ' -f3- | cut -c1-80)" || fail "push nube down"
last_push local | grep -q "^local up" && pass "el destino local se copió igualmente" || fail "local tras fallo"

echo; echo "Todas las pruebas superadas"
