---
title: Cómo está montado mi homelab
date: 2026-11-04
summary: "Dos mini PC con Debian, el sistema en el NVMe y los datos en el SSD, cada servicio en su carpeta con Docker Compose, monitorización con Prometheus y Uptime Kuma, y copias 3-2-1-0 a Backblaze B2. Qué hay, cómo está organizado y por qué."
tags: [Homelab, Debian, Docker, Backup, Backblaze B2, Arquitectura]
---

El homelab son dos mini PC en una estantería de casa. Lo uso para probar lo que en el trabajo no puedo romper, y también para servir esta web. Esta nota explica cómo está montado y, sobre todo, por qué está montado así.

## De un vistazo

| | homelab-red | homelab |
|---|---|---|
| Equipo | Lenovo ThinkCentre M715q Tiny | HP ProDesk 400 G6 Mini |
| Sistema | Debian 13 | Debian 13 |
| Función | Red y monitorización | Aplicaciones publicadas |
| Servicios | AdGuard Home (DNS y DHCP), Prometheus, Grafana, Blackbox Exporter, Uptime Kuma | Esta web (nginx), cloudflared |
| En las dos | Node Exporter, Docker Compose, copias con restic | |

La separación tiene un motivo: si rompo algo jugando con contenedores en una máquina, el DNS y el DHCP de casa siguen funcionando en la otra. Y la máquina que vigila no es la misma que sirve la web, así que si cae una, la otra me avisa.

## La red

- **HGU de Movistar** como salida a Internet.
- **Switch Gigabyte** de 5 puertos para la red de cable.
- **Xiaomi AX3600 con OpenWrt** para el Wi-Fi y una **VPN LAN-to-LAN** hacia una red remota.
- **DHCP centralizado en AdGuard Home**, no en el router. AdGuard tiene su propia IP en la red gracias a una interfaz *macvlan*, así que ve las IPs reales de cada equipo y filtra el DNS de toda la casa. Un detalle de macvlan: el propio host no puede hablar con ese contenedor, así que homelab-red tiene una pequeña interfaz *shim* que crea un servicio de systemd al arrancar ([`infra/homelab-red/macvlan-shim.service`](https://github.com/mateocouso94/mcouso-web/blob/main/infra/homelab-red/macvlan-shim.service)). Lo descubrí al reiniciar: sin ella, Uptime Kuma se quedaba sin DNS y marcaba media casa como caída.

Ningún servicio tiene puertos abiertos en el router. La web sale a Internet por **Cloudflare Tunnel**: un contenedor `cloudflared` abre la conexión hacia fuera.

## Dos discos, dos papeles

Cada mini PC tiene dos discos, y cada uno tiene un papel distinto:

```
NVMe  →  /       Debian, paquetes, Docker Engine          (se puede reinstalar)
SSD   →  /opt    /opt/ci/<servicio>/  compose + config + datos   (lo que importa)
```

La regla es que **en el NVMe no hay nada que no pueda reinstalar**. Todo lo que tiene valor vive en el SSD, en `/opt`: los `compose`, las configuraciones y los datos de cada servicio.

Así, si el NVMe se estropea:

1. Cambio el disco e instalo Debian y Docker.
2. Monto el SSD en `/opt`.
3. Ejecuto `docker compose up -d` en cada carpeta de `/opt/ci`.

Todo vuelve con sus datos, sin restaurar nada. Si el que falla es el SSD, para eso están las copias (más abajo).

No siempre fue así. Al preparar las copias vi que Uptime Kuma, Grafana y Prometheus guardaban sus datos en volúmenes de Docker dentro de `/var/lib/docker`, en el NVMe. Los moví a carpetas junto a su `compose`, en el SSD. Fueron un par de minutos de parada por servicio, y los volúmenes antiguos se quedaron intactos unos días por si había que volver atrás.

## Cómo está organizado Docker

Cada servicio tiene su carpeta en `/opt/ci`, con su `docker-compose.yml` y sus datos al lado:

```
/opt/ci/
├── adguard/        conf/  work/
├── monitoring/     docker-compose.yml  prometheus/  blackbox/  data/
├── uptime-kuma/    docker-compose.yml  data/
└── portfolio/      compose.yaml  .env   (esta web)
```

Las reglas son pocas y las mismas en todos los servicios:

- **Montajes de carpetas, no volúmenes con nombre.** Los datos se ven con un `ls`, se copian con las copias normales y se mueven a otra máquina copiando la carpeta.
- **Versiones fijadas** en las imágenes (`prom/prometheus:v3.8.0`, `grafana/grafana:12.3.0`…), nada de `latest`. Actualizo cuando yo decido, no cuando cambia la imagen.
- **Puertos ligados a la IP de la red local** (`192.168.0.20:3000:3000`), no a todas las interfaces.
- **Secretos en `.env`**, nunca dentro del `compose`.
- **Las imágenes no se copian.** Son reproducibles: se vuelven a descargar.

En la máquina de la web, el directorio de Docker también está en el SSD (`/opt/docker-data`). En homelab-red sigue en el NVMe, porque ahí ya solo quedan imágenes, que se descargan de nuevo.

## Esta web

La web es Next.js exportado como **ficheros estáticos** y servido por **nginx** en un contenedor de solo lectura. No hay Node.js en producción.

- Cada `git push` a GitHub compila la imagen, la prueba y la publica.
- La máquina **descarga** la imagen nueva cada 5 minutos con un timer de systemd. GitHub no entra en mi red: es la máquina la que pregunta.

Lo cuento con detalle en [Cómo se despliega esta web](/notas/como-se-despliega-esta-web/).

## Monitorización

- **Prometheus** recoge métricas: de las dos máquinas con Node Exporter, y de comprobaciones desde fuera con Blackbox Exporter. Guarda 30 días.
- **Grafana** las dibuja.
- **Uptime Kuma** vigila que cada servicio responde. Si algo cae, me avisa por **Telegram**. También recibe avisos de los procesos automáticos: el despliegue de la web, cada copia y cada verificación.

El estado de Kuma se ve en directo en [/estado/](/estado/). El panel de Kuma no está expuesto: la web solo lee su API de estado, y lo explico en [Una página de estado sin exponer Uptime Kuma](/notas/una-pagina-de-estado-sin-exponer-uptime-kuma/).

## Las copias: 3-2-1-0

- **3 copias**: los datos originales, una copia en el otro mini PC y otra en Backblaze B2.
- **2 soportes**: los discos de la otra máquina y la nube.
- **1 fuera de casa**: B2, en la región de Ámsterdam.
- **0 errores**: cada semana se restaura de verdad desde cada destino y se comprueba.

El "gestor" es deliberadamente sencillo: **restic** instalado en el sistema (no en Docker), dos scripts en bash y dos timers de systemd.

- **Cada noche**, `backup.sh` vuelca en caliente las bases de datos SQLite, escribe un fichero canario y copia `/opt/ci` y `/etc` a los dos destinos, con retención de 7 diarias, 4 semanales y 1 mensual.
- **Cada domingo**, `verify.sh` lee y valida parte de los datos, restaura el canario y comprueba la integridad de las bases de datos.
- Cada paso avisa a Kuma. Si algo falla o simplemente no se ejecuta, me llega un Telegram.

¿Por qué restic en el sistema y no en un contenedor? Porque el día que haya que restaurar, lo más probable es que Docker sea precisamente lo que está roto.

Todo el detalle, incluido lo que me encontré al instalarlo, está en [Copias 3-2-1-0 en mi homelab](/notas/copias-3-2-1-0/).

## Por qué Backblaze B2 y no un NAS

Me planteé comprar un NAS para las copias. Al final me quedé con Backblaze B2, por tres motivos.

**El precio.** Las copias de los dos mini PC ocupan unos 125 MiB después de comprimir y deduplicar. B2 cobra 6,95 $ por TB al mes y los primeros 10 GB son gratis, así que hoy me cuesta **0 €**. Aunque llegase a 100 GB, serían menos de un dólar al mes. Un NAS de dos bahías con sus discos son varios cientos de euros de entrada, y en unos años hay que cambiar los discos.

**El consumo eléctrico.** Un NAS está encendido las 24 horas. Con un consumo medio de unos 20 W, son unos 175 kWh al año. Al precio de la luz de este otoño (unos 0,19 €/kWh sin impuestos, PVPC), eso son **más de 30 € al año** solo en electricidad. Es más de lo que me costaría B2 durante décadas con lo que guardo ahora.

**Menos cosas que pueden fallar.** Un NAS son discos que se estropean, un RAID que vigilar, actualizaciones del sistema y una máquina más que mantener. Además, está en mi casa: un incendio, un robo o una subida de tensión se lo llevarían junto con los mini PC. B2 es, por definición, la copia fuera de casa, y del hardware se encarga Backblaze.

La copia cruzada entre los dos mini PC ya me da una copia local rápida de restaurar. Con B2 completo el 3-2-1 sin comprar nada. No descarto un NAS más adelante, pero para guardar más cosas, no por las copias del homelab.

## Lo siguiente

- Un repositorio privado con los `compose` y las configuraciones de todos los servicios, con el mismo despliegue automático que la web.
- Más monitores de servicio en Kuma: DNS contra AdGuard, Grafana, Prometheus y la VPN.
