---
title: Un informe diario del homelab con IA local
date: 2026-11-24
summary: "Cada mañana, un mini PC enciende mi PC de escritorio por la red, le pasa los datos de monitorización del homelab a gpt-oss:20b en mi GPU, me manda el resumen por Telegram y lo vuelve a apagar. Con IA local, porque esos datos describen mi red entera y no quiero que salgan de casa."
tags: [IA local, Ollama, gpt-oss, Homelab, Prometheus, Privacidad]
---

Mi [homelab](/notas/como-esta-montado-mi-homelab/) tiene Prometheus, Grafana y Uptime Kuma. Los datos estaban todos ahí, pero para enterarme de cómo iba tenía que entrar a mirar. Quería lo contrario: que cada mañana me llegara un resumen corto al móvil y solo tener que entrar cuando algo no cuadrase.

Para resumir datos técnicos en lenguaje normal, un modelo de lenguaje es justo la herramienta. La pregunta era cuál y dónde.

## Por qué local

Lo que le paso al modelo no es un texto cualquiera. Es la foto completa de mi red: nombres de máquinas, IPs, qué servicios corren en cada una, qué errores aparecen en los logs, a qué hora se hacen las copias. Esa información la trato como trataría la de un cliente: no la pego en una API externa sin pensarlo.

Con un modelo local esa duda desaparece. Los datos van de un mini PC a otro equipo de mi casa y vuelven, sin salir de la red. Puedo pasárselos tal cual, sin anonimizar nada antes.

Y tenía la GPU parada. Mi PC de escritorio pasa la mayor parte del día apagado. Un informe al día es un buen uso para él: coste cero y sin depender de ningún servicio externo.

No es que no use IA en la nube. Me apoyo mucho en ella para escribir los scripts, preparar los despliegues y automatizar tareas: hace en minutos lo que a mí me llevaría horas. Pero ahí trabaja con código y configuración. Los datos reales del día a día, los que describen mi red, los analiza la local.

## El equipo

La IA no corre en el homelab, sino en mi PC de escritorio. Los mini PC no tienen GPU, y la tarjeta del PC sí tiene memoria de sobra para un modelo mediano:

| | |
|---|---|
| CPU | AMD Ryzen 7 7800X3D |
| RAM | 32 GB DDR5-6400 |
| GPU | AMD Radeon RX 9070 XT, 16 GB de VRAM |
| Sistema | Windows 11 |
| Servidor del modelo | Ollama, nativo en Windows |

Un detalle de AMD: en Windows, ROCm todavía va irregular con las tarjetas RDNA 4, así que Ollama usa la GPU a través de **Vulkan**. Funciona bien, y el modelo corre al 100 % en la GPU.

El resto vive en el homelab, en el mini PC de monitorización: los scripts que recogen los datos, encienden y apagan el PC y hablan con el modelo, y [Open WebUI](https://openwebui.com/) como interfaz de chat para cuando quiero usar el modelo a mano.

## Por qué gpt-oss:20b

Busqué un modelo que cumpliera tres cosas: que cupiera **entero en los 16 GB de VRAM**, que fuera **rápido** y que siguiera bien unas instrucciones estrictas de formato. `gpt-oss:20b`, el modelo abierto de OpenAI, las cumple:

- **Cabe con margen.** Tiene 21.000 millones de parámetros, pero viene cuantizado a 4 bits (MXFP4) y ocupa unos 12 GB. Así quedan unos 4 GB libres para el contexto, que fijé en 16.000 tokens porque los datos de una semana entera son largos.
- **Es rápido porque es un MoE** (*mixture of experts*): de esos 21.000 millones, por cada token solo trabajan unos 3.600 millones. En mi tarjeta escribe a unos **106 tokens por segundo**. Para un resumen de 15 líneas, la generación tarda segundos.
- **Razonamiento ajustable.** Se le puede pedir que piense poco, medio o mucho. Para el informe uso el nivel medio: compensa a cambio de unos segundos más.
- **Licencia Apache 2.0.** Puedo usarlo como quiera, sin condiciones raras.

Antes probé un modelo más pequeño. Funcionaba, pero yo buscaba el mejor modelo posible sin perder velocidad en mi tarjeta, y, de lo que probé, `gpt-oss:20b` es el que mejor equilibra calidad y tokens por segundo con 16 GB de VRAM.

## La regla: nada depende del PC

El PC es mi equipo de escritorio, no un servidor, y está apagado casi todo el día. Así que la condición fue la misma que con la [réplica de la web](/notas/que-un-corte-de-luz-no-tumbe-la-web/): **el homelab no puede depender de él**. Si el PC está apagado o roto, lo único que deja de funcionar es la IA. La web, el DNS, la monitorización y las copias siguen igual.

## Cómo funciona

```
mini PC de monitorización                       PC de escritorio
  1. recoge datos (Prometheus, Kuma, logs)
  2. ¿PC apagado? → Wake-on-LAN  ───────────▶  arranca, Ollama listo en ~70 s
  3. le pasa los datos al modelo  ──────────▶  gpt-oss:20b en la GPU
  4. recibe el resumen            ◀──────────
  5. ordena el apagado            ──────────▶  se apaga con 2 min de aviso
  6. quita IPs y lo manda a Telegram
```

| Paso | Tiempo |
|---|---|
| Del Wake-on-LAN a tener Ollama respondiendo | ~70 s |
| Cargar el modelo en la VRAM (en frío) | ~34 s |
| Generar el resumen | unos segundos (~106 tokens/s) |

- El firewall del PC solo acepta conexiones a Ollama desde el mini PC de monitorización. Nadie más de la red puede usarlo.
- Para apagarlo, el mini PC entra por SSH con una clave que **solo puede ejecutar dos órdenes**: apagar en dos minutos o cancelar el apagado. Si alguien se hiciera con esa clave, lo peor que podría hacer es apagarme el PC.
- Si el PC **ya estaba encendido**, no carga la IA: puede que lo esté usando y no quiero quitarle la VRAM. En ese caso el informe llega igual, pero es un resumen corto con los números, sin IA.
- Solo puede haber una petición a la vez, para que una no apague el PC mientras otra lo está usando.

## Comprobado: Ollama no sale a internet

Que el modelo sea local no garantiza que nada salga. Ollama, el programa que lo sirve, tiene funciones opcionales en la nube (modelos remotos y búsqueda web) y además se conecta para actualizarse y descargar modelos. Yo no uso ninguna de esas funciones, pero no quería depender solo de eso:

- Las funciones en la nube están **desactivadas** en la configuración de Ollama.
- El firewall de Windows **bloquea toda la salida a internet** de Ollama. Las peticiones del mini PC siguen entrando, porque son conexiones de entrada desde la red de casa.
- Con el bloqueo puesto, el modelo responde igual. Para actualizar Ollama o bajar un modelo, desactivo la regla un momento y la vuelvo a activar.

## Qué le pido al modelo

El informe sale cada mañana y mira las últimas 24 horas; el domingo, la semana entera. Recoge el uso de disco y RAM, las temperaturas, los reinicios, la salud SMART de los discos, la disponibilidad de la web y los días que le quedan al certificado, los monitores de Kuma, los contenedores parados, el resultado de las copias, los errores del sistema y las actualizaciones pendientes.

Las instrucciones son cortas y estrictas: texto plano, una línea por área con números concretos, una lista final de "qué revisar" y **no inventar nada que no esté en los datos**.

## Lo único que sale de casa

El resumen llega por Telegram, y Telegram no está en mi casa. Así que, antes de enviarlo, el script cambia las IPs por nombres (`homelab`, `router`...) y tapa cualquier otra IP o MAC que se haya colado. El análisis se hace con todos los datos; al móvil solo llega el resumen, sin direcciones.

## Lo que encontró la primera semana

El domingo me llegó esto:

> ⚠️ Homelab: hay cosas que revisar. Prometheus no responde. Uptime Kuma no responde.

A la vez, Grafana me había mandado tres alertas de discos. Al mirarlo, había tres problemas distintos y ninguno era el que parecía:

- **Prometheus estaba en marcha, pero no guardaba datos.** Al mover sus datos al SSD semanas antes, la carpeta se quedó a nombre de root. Podía escribir en los ficheros que ya existían, pero no crear ninguno nuevo, y llevaba días así sin que nada lo detectara como caído.
- **Las alertas de discos no eran de los discos.** Eran alertas de "no hay datos", consecuencia de lo anterior. Los discos estaban bien.
- **El propio informe buscaba a Prometheus y a Kuma en la dirección equivocada.** Ese fallo era mío.

Dos días después, Grafana no arrancó tras un reinicio: el mismo problema de permisos, en su carpeta. Lo arreglé igual y revisé que ningún otro servicio estuviera en la misma situación.

Además, al revisarlo todo descubrí que Prometheus solo hacía pings: no comprobaba la web de verdad. Le añadí una comprobación HTTPS a mcouso.es, que ahora también le da al informe los días que le quedan al certificado. Y una alerta nueva en Grafana avisa si Prometheus deja de guardar datos. Las de disco ya no saltan cuando lo que falta son los datos.

La lección es la que esperaba: **la IA resume, pero no diagnostica.** El informe no acertó con la causa, pero me hizo mirar el domingo un fallo que llevaba días sin avisar. Para eso lo quería.

## Lo que me queda por hacer

- Medir el ciclo completo con el PC apagado y ver cuánto se puede acortar el arranque.
- Que el informe compare con la semana anterior, no solo describa la actual.
