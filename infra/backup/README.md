# Copias del homelab · 3-2-1-0

Copias con [restic](https://restic.net) de los dos mini PC (homelab-red y homelab-apps), con una regla sencilla:

| | Qué significa aquí |
|---|---|
| **3** copias | Los datos originales (SSD de `/opt` y NVMe del sistema) + copia en el **otro mini PC** + copia en **Backblaze B2** |
| **2** soportes | Discos de la otra máquina y almacenamiento en la nube |
| **1** fuera de casa | Backblaze B2, región EU Central (Ámsterdam) |
| **0** errores | Cada semana se **restaura de verdad** desde cada destino y se comprueba: integridad del repositorio, un fichero "canario" y las bases de datos |

Todo avisa a **Uptime Kuma** (monitores Push → Telegram) y se ve en [mcouso.es/estado](https://mcouso.es/estado/).

```
              homelab-red ──────── SFTP ────────► homelab-apps:/opt/backups/homelab-red
                   │                                         │
                   │                    SFTP ◄───────────────┘ homelab-apps → homelab-red:/opt/backups/homelab-apps
                   │
                   └──── S3 (cifrado) ────► Backblaze B2: mcouso-homelab-backup/<máquina>
                                                    ▲
              homelab-apps ─────────────────────────┘
```

## Qué hace

**Cada noche (03:30) — `backup.sh`**
1. Vuelca en caliente las bases de datos SQLite (`sqlite3 .backup`): copia consistente sin parar servicios. AdGuard nunca se para.
2. Ejecuta los scripts de `/etc/homelab-backup/pre.d/` (por ejemplo, volcados con `docker exec`).
3. Escribe un **canario** (valor aleatorio) que luego se usa para comprobar la restauración.
4. `restic backup` a cada destino de `repos.d/` y `restic forget --prune` con la retención: **7 diarias, 4 semanales, 1 mensual**.
5. Avisa a Kuma por destino: `up` con duración y tamaño añadido, o `down` con el error. Si un destino falla, los demás se copian igualmente.

**Cada domingo (05:30) — `verify.sh`**
1. `restic check --read-data-subset 5%`: lee y valida datos reales, no solo los índices.
2. Restaura el canario de la última copia y comprueba que es exactamente el que se escribió.
3. Restaura los volcados de las bases de datos y pasa `PRAGMA integrity_check`.
4. Avisa a Kuma: `up` si todo cuadra, `down` con el motivo.

Todo está cifrado con restic antes de salir de la máquina. Las copias son incrementales y deduplicadas.

## Probado en cada cambio

`.github/workflows/backup-test.yml` ejecuta `shellcheck` y `test/e2e.sh` con restic real: copia, exclusiones, retención, verificación, restauración byte a byte, detección de un repositorio corrupto y un destino caído que no impide los demás.

## Instalación

Se hace en **las dos máquinas**. Donde pone `homelab-red` / `192.168.0.30`, en la otra va al revés.

### 1. Usuario para recibir la copia del otro mini PC (SFTP enjaulado)

En **cada** máquina, para recibir la copia de la otra:

```bash
sudo useradd --system --home /opt/backups --shell /usr/sbin/nologin resticbk
sudo install -d -o root -g root -m 755 /opt/backups
sudo install -d -o resticbk -g resticbk -m 700 /opt/backups/homelab-red   # en homelab-apps; en homelab-red: homelab-apps
sudo install -d -o resticbk -g resticbk -m 700 /opt/backups/.ssh
sudo tee /etc/ssh/sshd_config.d/resticbk.conf >/dev/null <<'EOF'
Match User resticbk
    ChrootDirectory /opt/backups
    ForceCommand internal-sftp
    AuthorizedKeysFile /opt/backups/.ssh/authorized_keys
    AllowTcpForwarding no
    X11Forwarding no
    PasswordAuthentication no
EOF
sudo sshd -t && sudo systemctl reload ssh
```

El usuario `resticbk` solo puede usar SFTP y solo ve `/opt/backups`. No tiene shell.

### 2. Clave SSH de la máquina que envía

En la máquina **que envía** (por ejemplo homelab-red):

```bash
sudo ssh-keygen -t ed25519 -N '' -C "homelab-backup@$(hostname)" -f /root/.ssh/homelab-backup
sudo cat /root/.ssh/homelab-backup.pub
```

Pega esa línea en la **otra** máquina, en `/opt/backups/.ssh/authorized_keys`:

```bash
echo 'ssh-ed25519 AAAA... homelab-backup@homelab-red' | sudo tee -a /opt/backups/.ssh/authorized_keys
sudo chown resticbk:resticbk /opt/backups/.ssh/authorized_keys && sudo chmod 600 /opt/backups/.ssh/authorized_keys
```

Y de vuelta en la que envía, para que restic use esa clave y acepte el host:

```bash
sudo tee -a /root/.ssh/config >/dev/null <<'EOF'
Host 192.168.0.30
    User resticbk
    IdentityFile /root/.ssh/homelab-backup
EOF
sudo sftp 192.168.0.30 <<< 'ls'    # la primera vez acepta la huella; debe listar homelab-red
```

### 3. Instalar las copias

```bash
cd /opt/ci/portfolio/infra/backup     # o donde tengas el repositorio
sudo ./install.sh
```

Instala `restic` y `sqlite3`, copia los scripts a `/opt/homelab-backup/`, activa los timers y crea una contraseña en `/etc/homelab-backup/password`. Si ya existía `/etc/restic/password`, la reutiliza.

> **Guarda la contraseña en tu gestor de contraseñas.** Sin ella las copias no se pueden recuperar. Es lo único que no está en ninguna copia legible.

### 4. Configurar

```bash
sudo nano /etc/homelab-backup/backup.conf          # rutas, bases de datos, retención
sudo cp examples/repos.d/local.env examples/repos.d/b2.env /etc/homelab-backup/repos.d/
sudo nano /etc/homelab-backup/repos.d/local.env    # IP del otro mini PC y nombre de esta máquina
sudo nano /etc/homelab-backup/repos.d/b2.env       # endpoint, keyID y applicationKey de B2
sudo chmod 600 /etc/homelab-backup/repos.d/*.env
```

En Uptime Kuma, crea **tres monitores Push por máquina** (o los que prefieras) y pon sus URL en los `.env` y en `backup.conf`:

| Monitor | Intervalo | Dónde va la URL |
|---|---|---|
| `Copia homelab-red · local` | 93600 s (26 h) | `repos.d/local.env` → `KUMA_PUSH_URL` |
| `Copia homelab-red · B2` | 93600 s (26 h) | `repos.d/b2.env` → `KUMA_PUSH_URL` |
| `Verificación homelab-red` | 691200 s (8 días) | `backup.conf` → `VERIFY_PUSH_URL` |

Añádelos a la página de estado `homelab` en un grupo **Copias**: saldrán solos en mcouso.es/estado y en el comando `backup` de la consola.

### 5. Primera copia

```bash
sudo /opt/homelab-backup/backup.sh init                    # crea los repositorios
sudo systemctl start homelab-backup.service                # primera copia completa (puede tardar)
sudo systemctl start homelab-backup-verify.service         # primera verificación
journalctl -u homelab-backup -u homelab-backup-verify -n 30 --no-pager
systemctl list-timers 'homelab-backup*'
```

## Restaurar

Las variables de cada destino están en su `.env`. Para trabajar con uno:

```bash
sudo -i
set -a; . /etc/homelab-backup/repos.d/b2.env; set +a      # o local.env

restic snapshots                                           # qué copias hay
restic ls latest /opt/uptime-kuma                          # qué contiene
restic restore latest --target /tmp/restore --include /opt/uptime-kuma   # restaurar una carpeta
restic mount /mnt/restic                                   # navegar por todas las copias como carpetas
```

Las bases de datos están en `/var/backups/homelab-dumps/` dentro de cada copia. Los ficheros en uso
(`kuma.db*`, `grafana.db`) se excluyen a propósito: el volcado es la copia consistente. Para recuperar una, por ejemplo Kuma en homelab-red:

```bash
V=/var/lib/docker/volumes/uptime-kuma_uptime-kuma-data/_data
restic restore latest --target /tmp/r --include /var/backups/homelab-dumps
docker stop uptime-kuma
rm -f $V/kuma.db-wal $V/kuma.db-shm
cp /tmp/r/var/backups/homelab-dumps/var_lib_docker_volumes_uptime-kuma_uptime-kuma-data__data_kuma.db.sqlite3 $V/kuma.db
chown 1000:1000 $V/kuma.db        # el mismo dueño que tenía (ls -ln $V)
docker start uptime-kuma
```

Grafana igual, con `monitoring_grafana-data/_data/grafana.db` y el contenedor `grafana` (dueño `472`).

### Máquina nueva desde cero

1. Instalar Debian 13 y Docker, y montar el SSD en `/opt`.
2. `apt install restic` y crear `/etc/homelab-backup/password` con la contraseña guardada.
3. Crear `b2.env` (o `local.env` si la otra máquina sigue viva).
4. `restic restore latest --target / --include /opt --include /etc/homelab-backup`
5. `docker compose up -d` en cada servicio de `/opt`.

## Costes

Backblaze B2: 6,95 $/TB/mes y los primeros 10 GB gratis; subir y restaurar (hasta 3× lo guardado) no cuesta. Con la deduplicación de restic, un homelab con unas decenas de GB cuesta **céntimos al mes** o nada.
