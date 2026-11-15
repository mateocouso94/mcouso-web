# Réplica de reserva en la Raspberry Pi

Si se va la luz (o internet) en casa, mcouso.es se sirve desde una Raspberry Pi 3B en otra vivienda.
Sin VPN ni conexión entre las dos casas: la Pi solo habla con Cloudflare, GitHub y Telegram.

```
                       ┌── homelab (normal) ── cloudflared ── nginx
mcouso.es ── Cloudflare┤
                       └── Pi (reserva) ────── cloudflared ── nginx   ← solo encendido si homelab cae
                                  ▲
                    failover.sh pregunta cada minuto a la API de Cloudflare
                    si el conector de homelab (linux_amd64) sigue conectado
```

- **portfolio** corre siempre en la Pi (en caliente), con la misma imagen de ghcr.io (multi-arquitectura).
- **cloudflared** es una réplica del mismo túnel, pero solo se enciende cuando el conector de homelab
  lleva `TAKEOVER_AFTER` minutos desconectado, y se apaga cuando lleva `RELEASE_AFTER` minutos de vuelta.
  Así, con todo bien, nadie llega a la Pi.
- Sin Uptime Kuma: la consola y `/estado/` muestran "estado no disponible". Es la verdad durante un corte.
- Límite: detecta que el `cloudflared` de homelab no está conectado (luz, internet, mini PC apagado).
  Si cloudflared sigue conectado pero nginx falla, no salta: eso lo avisan Kuma y UptimeRobot.

## 1. Ruta del túnel (una sola vez, en casa)

Todas las réplicas de un túnel usan la misma ruta, así que tiene que funcionar en las dos máquinas.
Si ahora apunta a `http://192.168.0.30:3000`, la Pi no puede usarla. Se cambia por un nombre:

1. En homelab, añade al servicio `cloudflared` de su compose y recréalo:
   ```yaml
   extra_hosts:
     - "mcouso-origin:192.168.0.30"
   ```
2. Comprueba que resuelve: `docker exec <contenedor-cloudflared> getent hosts mcouso-origin`
   (si la imagen no trae `getent`, haz el paso 3 y mira que la web sigue respondiendo).
3. Zero Trust → Networks → Tunnels → tu túnel → Public hostnames → `mcouso.es`:
   servicio `http://mcouso-origin:3000`.

En la Pi, el contenedor de la web tiene el alias `mcouso-origin` en la red de compose, así que la misma ruta funciona.

## 2. Instalación en la Pi

Requisitos: SO de 64 bits (`uname -m` → `aarch64`).

```bash
# Docker, jq y git
curl -fsSL https://get.docker.com | sudo sh
sudo apt install -y jq git

# Logs en RAM para cuidar la microSD
sudo mkdir -p /etc/systemd/journald.conf.d
printf '[Journal]\nStorage=volatile\nRuntimeMaxUse=32M\n' | sudo tee /etc/systemd/journald.conf.d/volatile.conf
sudo systemctl restart systemd-journald

# Repo (misma ruta que en homelab)
sudo git clone https://github.com/mateocouso94/mcouso-web /opt/ci/portfolio
cd /opt/ci/portfolio/infra/replica-pi
sudo cp .env.example .env && sudo chmod 600 .env && sudo nano .env

# Web en caliente (cloudflared NO arranca aquí)
sudo docker compose up -d
curl -s -o /dev/null -w '%{http_code}\n' http://$(sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mcouso-portfolio):3000/   # 200

# Timers
sudo cp systemd/*.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mcouso-replica-failover.timer mcouso-replica-update.timer
```

Guarda el contenido del `.env` en Bitwarden: es lo único de la Pi que no sale del repo.
Si la microSD muere: grabar Raspberry Pi OS Lite 64 bits, repetir este apartado y listo.

## 3. Comprobar

```bash
sudo systemctl start mcouso-replica-failover.service
journalctl -u mcouso-replica-failover -n 5 --no-pager
# → homelab: 4 conexiones · sin homelab 0 min · con homelab 1 min · réplica activa: false
```

**Simulacro** (con calma, la web aguanta unos minutos): para `cloudflared` en homelab. A los ~3 min
llega el aviso de Telegram y `mcouso.es` responde desde la Pi (la consola dirá "estado no disponible").
Vuelve a arrancarlo: a los ~5 min la Pi devuelve el relevo.

## Ficheros

| Fichero | Qué hace |
|---|---|
| `docker-compose.yml` | web (siempre) + cloudflared (perfil `failover`, lo maneja el script) |
| `failover.sh` | cada minuto: API de Cloudflare → toma o devuelve el relevo, con histéresis |
| `update.sh` | cada 5 min: `git pull` + imagen nueva, como `deploy/update.sh` |
| `lib.sh` | lectura del `.env`, compose y avisos por Telegram |
| `systemd/` | timers de los dos scripts |

Los contadores viven en `/run` (RAM), para no escribir en la microSD cada minuto.
