---
title: Que un corte de luz no tumbe la web
date: 2026-11-15
summary: "Una noche se fue la luz en casa y la web estuvo caída varias horas. Ahora, si el homelab se queda sin luz o sin internet, una Raspberry Pi en otra vivienda sirve la web a los pocos minutos. Solo la web: el resto del homelab no tiene réplica, y es a propósito."
tags: [Cloudflare Tunnel, Failover, Raspberry Pi, Homelab, systemd]
---

Esta web se sirve desde un mini PC de mi [homelab](/notas/como-esta-montado-mi-homelab/). Una noche hubo un corte de luz largo y mcouso.es estuvo varias horas sin responder. No es una web crítica y unos minutos caída no me preocupan, pero horas sí.

La solución no era hacer más resistente mi casa, sino tener la web también **en otro sitio**. Solo la web.

## Solo la web, y es a propósito

La réplica es de la web y de nada más. El DNS, el DHCP, la monitorización y el resto del homelab no tienen un segundo equipo en otro sitio: si se va la luz en casa, se caen. Tienen [copias de sus datos](/notas/copias-3-2-1-0/) para recuperarlos, pero nada que los sirva mientras tanto.

Y tiene sentido. Esos servicios son para mi casa: si en casa no hay luz, nadie está usando el DNS ni el DHCP, y un segundo AdGuard en otra vivienda no le serviría a nadie. La web es lo único del homelab que se usa desde fuera, así que es lo único que tiene que seguir en pie cuando mi casa no está.

Tampoco lo llamaría alta disponibilidad: hay unos minutos de corte hasta que entra la réplica, y la réplica es una sola Raspberry Pi con una microSD. Para una web personal que aguanta caídas de unos minutos, es suficiente.

## Dónde: otra vivienda

Tengo una Raspberry Pi 3 en otra vivienda, con su propia luz y su propia conexión a internet. Hasta ahora no hacía casi nada, así que es perfecta para esto: si se va la luz en mi casa, allí no tiene por qué irse.

Puse dos condiciones:

- **Que no dependa del enlace entre las dos casas.** Hay una VPN entre las dos redes, pero no tiene nada que ver con la web y la réplica no la usa: si la VPN se cae, o se cae justo por el corte, la réplica tiene que funcionar igual. Tampoco hay puertos abiertos.
- **Nada de pagar un balanceador** para una web personal.

## Cómo lo resuelve Cloudflare Tunnel

La web ya se publica con un [túnel de Cloudflare](/notas/como-se-despliega-esta-web/). Un mismo túnel puede tener **varias réplicas** de `cloudflared` en máquinas distintas, y Cloudflare reparte las visitas entre las que estén conectadas. Si una desaparece, las demás siguen sirviendo.

Pero si las dos réplicas están activas a la vez, Cloudflare manda visitas a cualquiera de ellas, aunque mi casa esté bien. No quería eso: la web normal tiene que salir de mi homelab, y la Pi solo debe entrar cuando haga falta.

## Reserva, no reparto

En la Pi la web está siempre encendida, con la misma imagen Docker que en casa (publicada para amd64 y arm64), pero su `cloudflared` está **apagado**. Cada minuto, un script pregunta a la API de Cloudflare qué conectores tiene vivos el túnel:

```
¿Está conectado el cloudflared del homelab?
   ├─ no, durante 3 minutos seguidos  → la Pi enciende su cloudflared
   └─ sí, durante 5 minutos seguidos  → la Pi lo apaga y devuelve el relevo
```

- Quien "vigila" mi casa es **Cloudflare**, no la Pi. Por eso la réplica no necesita llegar a mi red para saber si está caída.
- Los minutos de margen evitan ir y volver por un corte de segundos.
- Si la API no responde (por ejemplo, porque se cae internet en la Pi), el script no cambia nada.
- El token de la API es de **solo lectura**: puede consultar el túnel, pero no tocarlo.
- La Pi se actualiza igual que el homelab: un timer de systemd que descarga la imagen nueva cada 5 minutos.

## El aviso que faltaba

Cuando la Pi toma el relevo, y cuando lo devuelve, me avisa por Telegram. Parece un detalle, pero es el único aviso que tengo de que mi casa se ha caído:

- **Uptime Kuma** vive en el homelab, así que cae con él y no puede avisar de nada.
- **El monitor externo** ya no ve ninguna caída, porque la web sigue respondiendo desde la Pi.

Así que, sin buscarlo, la réplica se ha convertido también en el vigilante de mi casa desde fuera. Si el aviso dice que la Pi ha tomado el relevo, es que el homelab (o al menos la máquina de la web) se ha quedado sin luz, sin internet o apagado.

## Si la web sale de la Pi, el homelab está caído

La Pi solo enciende su `cloudflared` cuando el homelab lleva unos minutos desconectado. Así que, si la web sale de la Pi, **es que el homelab está caído**: no hay otra forma de llegar ahí.

Eso afecta a la [página de estado](/estado/) y al comando `status` de la consola. El estado lo da [Uptime Kuma](/notas/una-pagina-de-estado-sin-exponer-uptime-kuma/), que vive en el homelab. Si en mi casa no hay luz, no hay monitorización que enseñar, la sirva la máquina que la sirva. Y la réplica no consulta Kuma a través de la VPN: no quiero que la web pública dependa de ese enlace.

En lugar de un "estado no disponible" a secas, la web lo explica. Cada nginx sabe quién es (`/api/origin` devuelve `homelab` o `replica`), y cuando la que responde es la réplica, la página de estado y la consola dicen:

> El homelab no responde ahora mismo (corte de luz o de internet en casa). Esta web la está sirviendo una réplica de reserva en otra vivienda. La monitorización vive en el homelab, así que volverá cuando vuelva él.

Durante un corte, la web sigue en pie y además cuenta lo que pasa.

## La prueba

Lo monté durante otro corte de luz, con el homelab apagado. En cuanto activé los timers, la Pi vio que el conector de casa llevaba varios minutos desaparecido, encendió su `cloudflared` y mcouso.es volvió a responder, ahora desde otra vivienda. Cuando volvió la luz, el homelab se reconectó y, cinco minutos después, la Pi le devolvió la web sola.

## Lo que me queda por hacer

- **Que el monitor externo distinga desde qué máquina sale la web**, como segunda vía de aviso además de Telegram.
- **Un simulacro con todo encendido**: apagar el `cloudflared` de casa a propósito y cronometrar el relevo y la vuelta.
- Una limitación conocida: el script detecta que el conector del homelab ha desaparecido (luz, internet, mini PC apagado), pero no que nginx falle con el conector conectado. Eso lo siguen avisando Uptime Kuma y el monitor externo.

El código está en [`infra/replica-pi`](https://github.com/mateocouso94/mcouso-web/tree/main/infra/replica-pi).
