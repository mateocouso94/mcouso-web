---
title: Un informe diario del homelab con IA local (y por qué elegí el modelo lento)
date: 2026-11-25
summary: "Cada mañana, un mini PC enciende mi PC de escritorio, le pasa los datos del homelab a un modelo de IA local y me manda el resumen por Telegram. Empecé con un modelo rápido; tras compararlo con otros cuatro sobre los mismos datos, me quedé con el más lento, porque era el único que no se equivocaba."
tags: [IA local, Ollama, Gemma, Homelab, Prometheus, Privacidad]
---

Mi [homelab](/notas/como-esta-montado-mi-homelab/) tiene Prometheus, Grafana y Uptime Kuma. Los datos estaban todos ahí, pero para enterarme de cómo iba tenía que entrar a mirar. Quería lo contrario: que cada mañana me llegara un resumen corto al móvil y solo tener que entrar cuando algo no cuadrase.

Para resumir datos técnicos en lenguaje normal, un modelo de lenguaje es justo la herramienta. Esta nota cuenta cómo lo monté y, sobre todo, cómo elegí el modelo: primero por velocidad, que fue un error, y después por fidelidad.

## Por qué local

Lo que le paso al modelo es la foto completa de mi red: nombres de máquinas, IPs, servicios, errores de los logs y la hora de las copias. Esa información la trato como trataría la de un cliente: no la pego en una API externa sin pensarlo. Con un modelo local, los datos van de un mini PC a otro equipo de mi casa y vuelven, sin salir de la red.

No es que no use IA en la nube. Me apoyo mucho en ella para escribir los scripts, preparar los despliegues y automatizar tareas: hace en minutos lo que a mí me llevaría horas. Pero ahí trabaja con código y configuración. Los datos reales del día a día, los que describen mi red, los analiza la local.

## El equipo

La IA corre en mi PC de escritorio, no en el homelab: los mini PC no tienen GPU.

| | |
|---|---|
| CPU | AMD Ryzen 7 7800X3D |
| RAM | 32 GB DDR5-6400 |
| GPU | AMD Radeon RX 9070 XT, 16 GB de VRAM |
| Sistema | Windows 11 |
| Modelos | en un NVMe de 1 TB dedicado |
| Servidor de modelos | Ollama, nativo en Windows, con la GPU a través de Vulkan |

En Windows, ROCm todavía va irregular con las tarjetas RDNA 4, así que Ollama usa la GPU con **Vulkan**. Funciona bien.

## La regla: nada depende del PC

El PC es mi equipo de escritorio, no un servidor, y está apagado casi todo el día. Así que la condición fue la misma que con la [réplica de la web](/notas/que-un-corte-de-luz-no-tumbe-la-web/): **el homelab no puede depender de él**. Si el PC está apagado o roto, lo único que deja de funcionar es la IA.

## Cómo funciona

```
mini PC de monitorización                       PC de escritorio
  1. recoge datos (Prometheus, Kuma, logs)
  2. ¿PC apagado? → Wake-on-LAN  ───────────▶  arranca, Ollama listo en ~70 s
  3. le pasa los datos al modelo  ──────────▶  gemma4:31b (GPU + RAM)
  4. recibe el resumen            ◀──────────
  5. ordena el apagado            ──────────▶  se apaga con 2 min de aviso
  6. quita IPs y lo manda a Telegram
```

- El firewall del PC solo acepta conexiones a Ollama desde el mini PC de monitorización.
- Para apagarlo, el mini PC entra por SSH con una clave que **solo puede ejecutar dos órdenes**: apagar en dos minutos o cancelar el apagado.
- Si el PC **ya estaba encendido**, el informe no carga la IA, porque puede que lo esté usando. Llega igual, pero como un resumen corto con los números.
- Si el modelo principal falla, el informe lo intenta con un **modelo de reserva** más pequeño y lo indica en el título.

## Elegir el modelo: primero por velocidad

Empecé con `gpt-oss:20b`, un modelo MoE (*mixture of experts*). Tiene 21.000 millones de parámetros, pero por cada token solo trabajan unos 3.600 millones. Por eso, en mi tarjeta escribe a más de 100 tokens por segundo, y además cabe entero en la VRAM. Sobre el papel, era la elección obvia.

El razonamiento tenía un fallo: **para un informe diario, la velocidad casi no importa**. Se genera una vez al día, de madrugada. Que el texto tarde 5 o 60 segundos da igual cuando solo arrancar el PC ya lleva un minuto. Lo que importa es que el informe diga la verdad.

## La comparación

Para elegir con datos y no por intuición, escribí un pequeño script, `comparar-modelos`. Le pasa **los mismos datos y las mismas instrucciones** que usa el informe a varios modelos y guarda cada respuesta con sus tiempos. Lo que medí fue fidelidad: si el informe coincide con los datos, si inventa algo, si respeta el formato y si avisa de lo que de verdad hay que revisar.

Los datos de prueba tenían dos problemas reales: la disponibilidad de la web había bajado al 93 % por una caída nocturna, y un servicio de systemd había fallado.

**Primera ronda: MoE contra denso.**

| Modelo | Tipo | Velocidad | Resultado |
|---|---|---|---|
| `gpt-oss:20b` | MoE, 3,6B activos | 113 tokens/s | Rápido, pero **marcó como problema un certificado que caducaba en 67 días** (el umbral es 21). No mencionó el servicio fallido y mezcló inglés. |
| `qwen3:14b` | denso | 57 tokens/s | Vio el servicio fallido y no inventó nada, pero mezcló los datos de las dos máquinas sin decir de cuál era cada número. |

Con la mitad de velocidad, el modelo denso fue más fiel. Los fallos de formato del denso se podían corregir con instrucciones; los inventos del MoE, no. Así que ajusté las instrucciones (nombrar cada máquina, solo contar como problema lo que cumpla los criterios, no copiar líneas de log) y amplié la prueba a modelos densos más grandes.

**Segunda ronda: densos, de 14B a 31B.**

Como la velocidad no importaba, probé también modelos que no caben enteros en 16 GB: la parte que no cabe va a la RAM del sistema y el modelo va más lento, pero funciona.

| Modelo | Carga | Velocidad | Tiempo total | Resultado |
|---|---|---|---|---|
| `qwen3:14b` | 23 s | 57 tokens/s | 33 s | Encabezó con "✅ en orden" y luego listó problemas. Dijo que los discos estaban por debajo del 20 % (estaban al 22 % y al 26 %). |
| `magistral:24b` | 36 s | 17 tokens/s | 49 s | "✅ en orden" con la web al 93 %. **Se inventó la hora de la última copia.** |
| `mistral-small3.2:24b` | 39 s | 14 tokens/s | 55 s | "✅ en orden". Copió líneas de log en inglés y no avisó de ningún problema. |
| **`gemma4:31b`** | 52 s | **8 tokens/s** | **7 min** | **Correcto de principio a fin**: el aviso arriba, el disco de cada máquina, los dos problemas en "Revisar" con su máquina y, como no tenía la hora de la copia, la omitió en vez de inventarla. |

## Por qué el modelo lento

Me quedé con **`gemma4:31b`**, un modelo denso de 31.000 millones de parámetros. Es el más lento de todos: 8 tokens por segundo, porque parte del modelo va en la RAM y porque razona mucho antes de responder (unos 2.700 tokens para un informe de 12 líneas). Cada informe tarda unos 7 minutos.

Y me da igual, porque es **el único que no se equivocó**. En un informe de monitorización, un error tiene consecuencias. Un "✅ todo en orden" con la web caída es peor que no tener informe. Un problema inventado hace que dejes de fiarte de los avisos reales. Valoro más la fidelidad que la rapidez, y aquí la diferencia la marca el tamaño: el modelo grande razona mejor sobre datos que no ha visto nunca.

Lo que cuesta: el PC encendido unos 10 minutos al día, contando el arranque y el apagado y el informe llegando unos minutos más tarde. Como reserva dejé `qwen3:14b`, que también es el que uso para chatear, porque a 57 tokens/s se nota mucho la diferencia.

Dos matices honestos:
- **Es una sola prueba por modelo.** Estos modelos no siempre responden igual, así que la repetiré con datos nuevos antes de darla por cerrada.
- La primera ronda favoreció a `gpt-oss` en el tiempo: ya estaba cargado en memoria y no tuvo que leerse del disco.

## Comprobado: Ollama no sale a internet

Que el modelo sea local no garantiza que nada salga. Ollama tiene funciones opcionales en la nube (modelos remotos y búsqueda web) y además se conecta para actualizarse y descargar modelos. No uso ninguna, pero no quería depender solo de eso:

- Las funciones en la nube están **desactivadas** en la configuración de Ollama.
- El firewall de Windows **bloquea toda la salida a internet** de Ollama. Las peticiones del mini PC siguen entrando porque son conexiones de entrada.
- Para descargar un modelo, desactivo la regla un momento y la vuelvo a activar.

## Qué le pido al modelo

El informe sale cada mañana y mira las últimas 24 horas; el domingo, la semana entera. Recoge el uso de disco y RAM, las temperaturas, los reinicios, la salud SMART, la disponibilidad de la web y los días de certificado, los monitores de Kuma, los contenedores, las copias, los errores del sistema y las actualizaciones pendientes.

Las instrucciones las fui afinando con los fallos de la comparación: texto plano, una línea por área con números concretos y el nombre de cada máquina, la primera línea en ⚠️ si hay cualquier problema, una lista final de "qué revisar", resumir con palabras propias y **no inventar nada que no esté en los datos**.

## Lo único que sale de casa

El resumen llega por Telegram, y Telegram no está en mi casa. Antes de enviarlo, el script cambia las IPs por nombres (`homelab`, `router`...) y tapa cualquier otra IP o MAC que se haya colado. El análisis se hace con todos los datos; al móvil solo llega el resumen, sin direcciones.

## Lo que encontró la primera semana

El primer domingo, el informe avisó de que Prometheus y Kuma no respondían, y Grafana mandó tres alertas de discos. Al mirarlo, ninguno de los problemas era el que parecía:

- **Prometheus estaba en marcha, pero no guardaba datos.** Al mover sus datos al SSD semanas antes, la carpeta quedó a nombre de root: podía escribir en los ficheros existentes, pero no crear ninguno nuevo. Dos días después, a Grafana le pasó lo mismo al reiniciarse.
- **Las alertas de discos no eran de los discos:** eran alertas de "no hay datos", consecuencia de lo anterior.
- **El propio informe buscaba a Prometheus y Kuma en la dirección equivocada.** Ese fallo era mío.

Ahora una alerta avisa si Prometheus deja de guardar datos, y Prometheus comprueba la web por HTTPS además de por ping.

## Lo que me llevo

- **La IA resume, no diagnostica.** El informe no acertó con la causa, pero me hizo mirar un fallo que llevaba días sin avisar.
- **Elegir un modelo es medir, no leer benchmarks.** El que ganaba en las tablas de velocidad fue el que inventó un problema con mis datos.
- **Para analizar, fidelidad antes que velocidad.** Un informe que tarda 7 minutos y acierta vale más que uno que tarda 17 segundos y se equivoca.
