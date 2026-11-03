---
title: Cómo se despliega esta web
date: 2026-11-03
summary: Un git push y, unos minutos después, la web está actualizada en mi homelab. Sin abrir puertos y sin que GitHub entre en mi red.
tags: [Docker, GitHub Actions, Cloudflare Tunnel, systemd, nginx]
---

Esta web corre en un mini PC que tengo en casa. Al principio la actualizaba a mano: copiaba los ficheros al servidor, hacía `docker compose build` y la levantaba. Funcionaba, pero cada cambio de una coma era entrar por SSH. Ahora basta con hacer un commit.

## El recorrido completo

```
git push (main)
   │
   ▼
GitHub Actions ── compila la web y la imagen Docker
   │
   ▼
ghcr.io/mateocouso94/mcouso-web:latest
   │
   ▼  (el servidor pregunta cada 5 minutos)
homelab-apps ── timer de systemd → docker compose pull + up -d
   │
   ▼
nginx :3000 ◄── cloudflared ◄── Cloudflare ◄── mcouso.es
```

## La web: ficheros estáticos y nginx

La web está hecha con Next.js, pero no tiene backend: no hay formularios, ni base de datos, ni nada que calcular en el servidor. Así que se compila como **sitio estático** (`output: 'export'`) y lo que llega a producción son solo ficheros HTML, CSS y JavaScript.

Los sirve un contenedor `nginx:alpine` con pocas cosas, pero bien puestas:

- **Sistema de ficheros de solo lectura** (`read_only: true`), con `tmpfs` solo para la caché y el PID de nginx.
- `no-new-privileges`, para que nada dentro del contenedor pueda escalar privilegios.
- **Healthcheck**: Docker comprueba cada 30 segundos que nginx responde.
- **Cabeceras de seguridad** (`X-Frame-Options`, `nosniff`, `Referrer-Policy`...) y caché larga para los ficheros con hash en el nombre.

En producción no hay Node.js. Menos piezas, menos cosas que parchear.

## La compilación: GitHub Actions

Cada push a `main` lanza un workflow que construye la imagen Docker y la publica en GitHub Container Registry con dos etiquetas: `latest` y el hash del commit. La segunda sirve para volver atrás: si una versión sale mal, pongo el hash anterior en el `compose.yaml` y en un minuto estoy como antes.

Los cambios también pueden entrar como Pull Request. En ese caso el workflow compila, pero no publica: es una comprobación de que lo que voy a fusionar no rompe nada.

## El despliegue: pull, no push

Lo más habitual es que el CI se conecte al servidor por SSH y despliegue. No quería eso: significaría dar a GitHub una forma de entrar en mi red.

Así que lo hago al revés. En el servidor hay un **timer de systemd** que cada 5 minutos ejecuta un script:

```bash
before=$(docker image inspect -f '{{.Id}}' ghcr.io/mateocouso94/mcouso-web:latest)
docker compose pull --quiet portfolio
after=$(docker image inspect -f '{{.Id}}' ghcr.io/mateocouso94/mcouso-web:latest)

if [[ "$before" != "$after" ]]; then
  docker compose up -d --no-build portfolio
  docker image prune -f
fi
```

Si la imagen no ha cambiado, no hace nada. Si ha cambiado, recrea el contenedor. Todo queda en el journal:

```bash
journalctl -u mcouso-web-update
```

Elegí un timer de systemd en lugar de Watchtower porque no necesita montar el socket de Docker en otro contenedor y porque es algo que ya sé leer y depurar.

## La publicación: Cloudflare Tunnel

El contenedor solo escucha en la IP privada del servidor. Para que sea accesible desde Internet hay otro contenedor con `cloudflared`, que abre una conexión saliente hacia Cloudflare. Las visitas entran por ahí. El router no tiene **ningún puerto abierto**.

## Mantenimiento

Dependabot revisa cada semana las dependencias (Next.js, React, la imagen de nginx, las acciones de GitHub) y abre una Pull Request por cada actualización. El CI la compila; si pasa, la fusiono y se despliega sola. Las versiones mayores las dejo fuera: esas se revisan a mano.

## Lo que me queda por hacer

- Publicar el Uptime Kuma como página de estado.
- Avisos por Telegram si el despliegue falla o la web deja de responder.

El código está en [github.com/mateocouso94/mcouso-web](https://github.com/mateocouso94/mcouso-web).
