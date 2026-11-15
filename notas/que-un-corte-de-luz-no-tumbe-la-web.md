---
title: Que un corte de luz no tumbe la web
date: 2026-11-15
summary: "Una noche se fue la luz en casa y la web estuvo caída varias horas. Ahora, si el homelab se queda sin luz o sin internet, una Raspberry Pi en otra vivienda toma el relevo sola en unos minutos. Sin VPN entre las dos casas y sin balanceador de pago."
tags: [Cloudflare Tunnel, Alta disponibilidad, Raspberry Pi, Homelab, systemd]
---

Esta web se sirve desde un mini PC de mi [homelab](/notas/como-esta-montado-mi-homelab/). Una noche hubo un corte de luz largo y mcouso.es estuvo varias horas sin responder. No es una web crítica y unos minutos caída no me preocupan, pero horas sí.

La solución no era hacer más resistente mi casa, sino tener la web también **en otro sitio**.

## La idea: una réplica en otra vivienda

Tengo una Raspberry Pi 3 en otra vivienda, con su propia luz y su propia conexión a internet. Hasta ahora no hacía casi nada, así que es perfecta para esto: si se va la luz en mi casa, allí no tiene por qué irse.

Puse dos condiciones:

- **Nada de conectar las dos casas.** Ni VPN entre redes ni puertos abiertos. La Pi no sabe nada de mi red, y mi red no sabe nada de la Pi.
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

- Quien "vigila" mi casa es **Cloudflare**, no la Pi. Por eso no hace falta ninguna conexión entre las dos viviendas.
- Los minutos de margen evitan ir y volver por un corte de segundos.
- Si la API no responde (por ejemplo, porque se cae internet en la Pi), el script no cambia nada.
- El token de la API es de **solo lectura**: puede consultar el túnel, pero no tocarlo.
- La Pi se actualiza igual que el homelab: un timer de systemd que descarga la imagen nueva cada 5 minutos.

## La monitorización no viaja con la web

Hay algo que se ve distinto cuando la web sale de la Pi: la [página de estado](/estado/) y el comando `status` de la consola dicen **"estado no disponible ahora mismo"**.

No es un fallo de la réplica. El estado lo da [Uptime Kuma](/notas/una-pagina-de-estado-sin-exponer-uptime-kuma/), que vive en el homelab. Si en mi casa no hay luz, no hay monitorización que enseñar, la sirva la máquina que la sirva. Con el homelab apagado, la página de estado diría lo mismo aunque la web siguiera saliendo de casa. La Pi tampoco puede consultar Kuma, porque no hay conexión entre las dos redes, y así lo quiero.

Así que, durante un corte, la web sigue en pie y es honesta: el contenido está, pero el estado del homelab no se puede ver.

## La prueba

Lo monté durante otro corte de luz, con el homelab apagado. En cuanto activé los timers, la Pi vio que el conector de casa llevaba varios minutos desaparecido, encendió su `cloudflared` y mcouso.es volvió a responder, ahora desde otra vivienda.

## Lo que me queda por hacer

- **Monitorizar la propia réplica**: avisos por Telegram cuando la Pi toma o devuelve el relevo, y saber desde fuera desde qué máquina sale la web.
- **Un simulacro con todo encendido**: apagar el `cloudflared` de casa a propósito y cronometrar el relevo y la vuelta.
- Una limitación conocida: el script detecta que el conector del homelab ha desaparecido (luz, internet, mini PC apagado), pero no que nginx falle con el conector conectado. Eso lo siguen avisando Uptime Kuma y el monitor externo.

El código está en [`infra/replica-pi`](https://github.com/mateocouso94/mcouso-web/tree/main/infra/replica-pi).
