---
title: "Mi homelab: dos mini PC y una red con DHCP centralizado"
date: 2026-11-03
summary: Qué tengo montado en casa, por qué está repartido en dos máquinas y qué hace cada una. DNS y DHCP con AdGuard, monitorización con Prometheus, Grafana y Uptime Kuma, y contenedores aparte.
tags: [Homelab, Debian, AdGuard Home, Prometheus, Grafana, Docker]
draft: true
---

> ✏️ PENDIENTE: revisa todo el texto y quita estos avisos antes de publicar. Para publicar, borra la línea `draft: true`.

En el trabajo hay cosas que no se pueden romper. En casa sí. Para eso tengo el homelab: dos mini PC con **Debian 13** y una red montada con un poco más de cuidado de lo normal.

## Las dos máquinas

**homelab-red** · Lenovo ThinkCentre M715q Tiny
- **AdGuard Home** para DNS y DHCP de toda la casa.
- **Prometheus**, **Grafana**, Node Exporter, Blackbox Exporter y **Uptime Kuma** para la monitorización.

**homelab-apps** · HP ProDesk 400 G6 Mini
- **Docker Compose** con las aplicaciones, entre ellas esta web.
- **cloudflared** para publicarla sin abrir puertos.

La idea de separarlas es sencilla: si rompo algo jugando con contenedores, el DNS y el DHCP de casa siguen funcionando. Y la máquina que vigila no es la misma que la que sirve la web.

> ✏️ PENDIENTE: ¿por qué estos dos modelos? ¿Cuánto consumen? Es una pregunta típica de quien quiere montar algo parecido.

## La red

- **HGU de Movistar** como salida.
- **Switch Gigabyte** de 5 puertos.
- **Xiaomi AX3600 con OpenWrt** para el Wi-Fi y la VPN.
- **VPN LAN-to-LAN** hacia una red remota.

El **DHCP está centralizado** en AdGuard Home, no en el router. AdGuard corre con una interfaz **macvlan**, con su propia IP en la red.

> ✏️ PENDIENTE: ¿por qué macvlan? (¿para que AdGuard tenga IP propia y vea las IPs reales de los clientes?) ¿Qué tuviste que desactivar en el HGU y en el router para que el DHCP no se pisara?

## La monitorización

- **Prometheus** recoge métricas con Node Exporter (las máquinas) y Blackbox Exporter (comprobaciones desde fuera).
- **Grafana** para verlas.
- **Uptime Kuma** para saber si algo está caído y avisarme por Telegram.

El estado de Kuma se ve en directo en [mcouso.es/estado](/estado/).

> ✏️ PENDIENTE: ¿qué dashboards de Grafana usas? Una captura (sin IPs) quedaría muy bien aquí: se puede poner con `![texto](/notas/imagen.png)`, me pasas la imagen y la subo.

## Lo siguiente

> ✏️ PENDIENTE: ¿qué quieres montar después? (¿Proxmox, copias con Restic, más servicios?) Cerrar con planes hace que la nota no parezca terminada para siempre.
