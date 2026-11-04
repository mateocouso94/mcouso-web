---
title: Una página de estado sin exponer Uptime Kuma
date: 2026-11-03
summary: "Quería enseñar el estado de mi homelab en la web sin publicar el panel de Uptime Kuma. La solución: que el nginx de la web reenvíe solo dos URLs de lectura."
tags: [Uptime Kuma, nginx, Seguridad, Homelab]
---

Uptime Kuma tiene páginas de estado públicas, y lo fácil habría sido publicarlo en un subdominio a través del túnel de Cloudflare. El problema es que entonces también queda en Internet **la pantalla de login del panel de administración**. No quería eso.

## La idea

La web ya tiene su propio nginx. Kuma, para sus páginas de estado, usa dos URLs de solo lectura que devuelven JSON:

- `/api/status-page/<slug>`: la lista de monitores y grupos.
- `/api/status-page/heartbeat/<slug>`: los últimos latidos y el uptime.

Así que el nginx de la web reenvía **solo esas dos**, y nada más:

```nginx
location = /api/status/homelab {
    limit_except GET { deny all; }
    proxy_pass ${KUMA_URL}/api/status-page/homelab;
    proxy_connect_timeout 3s;
    proxy_read_timeout 5s;
    proxy_hide_header Set-Cookie;
    add_header Cache-Control "no-store" always;
}
```

- `location =`: coincidencia exacta, no se puede pedir otra ruta de Kuma.
- `limit_except GET`: cualquier otro método recibe un 403.
- `proxy_hide_header Set-Cookie`: no sale ninguna cookie de Kuma.
- `KUMA_URL` va en un `.env` del servidor, no en el repositorio.

Kuma sigue escuchando solo en la red local.

## La página

Con esos datos, la propia web pinta [/estado/](/estado/) y la consola de la portada (prueba el comando `status`). Se actualiza cada minuto, en el navegador.

En Kuma, además, cada monitor tiene la opción **Show Clickable Link** desactivada: así la API pública no devuelve URLs ni IPs internas, solo nombres y estados.

## El detalle de nginx en solo lectura

El contenedor de la web corre con el sistema de ficheros en **solo lectura**. La imagen oficial de nginx genera la configuración a partir de plantillas al arrancar (sustituyendo `${KUMA_URL}`), pero necesita escribir el resultado en algún sitio. La solución fue generarla en `/var/run`, que ya es un `tmpfs`:

```dockerfile
ENV NGINX_ENVSUBST_OUTPUT_DIR=/var/run
RUN sed -i 's#include /etc/nginx/conf.d/\*.conf;#include /var/run/*.conf;#' /etc/nginx/nginx.conf
```

## Y si Kuma no responde

nginx devuelve un 502 y la web muestra "estado no disponible". La web sigue funcionando: lo que falla es la monitorización, no el servicio.

El código está en [github.com/mateocouso94/mcouso-web](https://github.com/mateocouso94/mcouso-web).
