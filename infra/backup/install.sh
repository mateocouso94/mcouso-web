#!/usr/bin/env bash
# Instala o actualiza las copias del homelab en esta máquina. Se puede ejecutar varias veces.
#   sudo ./install.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Ejecútalo con sudo"; exit 1; }
cd "$(dirname "$(readlink -f "$0")")"

apt-get install -y -q restic sqlite3 curl >/dev/null
install -d -m 755 /opt/homelab-backup
install -m 755 lib.sh backup.sh verify.sh /opt/homelab-backup/
install -m 644 systemd/*.service systemd/*.timer /etc/systemd/system/

install -d -m 700 /etc/homelab-backup /etc/homelab-backup/repos.d /etc/homelab-backup/pre.d
[[ -f /etc/homelab-backup/backup.conf ]] || install -m 600 examples/backup.conf /etc/homelab-backup/backup.conf
if [[ ! -f /etc/homelab-backup/password && -f /etc/restic/password ]]; then
  # Si ya seguiste la guía de B2 con /etc/restic, se reutiliza esa contraseña (el repo ya está creado con ella)
  install -m 600 /etc/restic/password /etc/homelab-backup/password
  echo "Reutilizada la contraseña de /etc/restic/password."
fi
if [[ ! -f /etc/homelab-backup/password ]]; then
  head -c 32 /dev/urandom | base64 > /etc/homelab-backup/password
  chmod 600 /etc/homelab-backup/password
  echo "Contraseña nueva creada en /etc/homelab-backup/password."
  echo ">>> GUÁRDALA en tu gestor de contraseñas: sin ella las copias no se pueden recuperar. <<<"
fi

systemctl daemon-reload
systemctl enable --now homelab-backup.timer homelab-backup-verify.timer
echo "Instalado. Siguiente: crea los destinos en /etc/homelab-backup/repos.d/ (ver examples/repos.d)"
echo "y ejecuta: sudo /opt/homelab-backup/backup.sh init && sudo systemctl start homelab-backup.service"
