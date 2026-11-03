---
title: Un datacenter VMware desde cero
date: 2026-11-03
summary: Cinco hosts Dell, una cabina Pure Storage por NVMe over RoCE y una red pensada para separar todo. Las decisiones que tomé y por qué.
tags: [VMware, ESXi 8, Pure Storage, NVMe-oF, Redes]
draft: true
---

> ✏️ PENDIENTE: revisa todo el texto y quita estos avisos antes de publicar. Para publicar, borra la línea `draft: true`.

Hacía falta un datacenter nuevo al que mover los clientes del antiguo, que estaba en vSphere 7. Me tocó diseñarlo y montarlo, y es probablemente el proyecto del que más he aprendido.

## El hardware

- **5 hosts Dell** con AMD EPYC de 64 núcleos.
- **Switches Dell** a 100 Gb.
- **Cabina Pure Storage** conectada por **NVMe over RoCE**, con 400 Gb.
- Un **único clúster** con su propio vCenter, independiente del antiguo.
- Las copias, en una **segunda cabina Pure**.

> ✏️ PENDIENTE: ¿cuánta RAM llevaba cada host? (comentaste ~1 TB pero no estabas seguro). ¿Por qué un vCenter independiente y no ampliar el existente?

## La red: separar todo

Cada host tiene:

| Uso | Ancho de banda |
|---|---|
| SAN (NVMe over RoCE) | 200 Gb |
| vMotion | 200 Gb |
| Salida a Internet (vía Fortinet) | 10 Gb |

La **red de gestión** va aparte: su propia VLAN, consolas de los servidores separadas y acceso solo por **VPN**. Nada de gestión expuesto en la red de servicio.

Para los clientes, **un VDS por cliente**. Los clientes grandes, además, con su propio **Fortinet virtual**.

> ✏️ PENDIENTE: ¿por qué un VDS por cliente en lugar de port groups en un VDS compartido? Explicar esa decisión le da mucho valor a la nota.

## Antes de instalar nada: la matriz de compatibilidad

Antes de tocar un ESXi pasé por la parte que nadie ve: matriz de compatibilidad de VMware, versiones de firmware de la gestión remota, BIOS, drivers y la imagen de ESXi 8 personalizada para ese hardware. En un entorno con NVMe over RoCE esto no es opcional: si la tarjeta, el driver y el firmware no cuadran, no hay almacenamiento.

> ✏️ PENDIENTE: ¿hubo alguna incompatibilidad o versión que tuvieras que cambiar? Una anécdota concreta aquí vale oro.

## La cabina: NVMe over RoCE

La inicialización de la cabina la hice yo, en contacto con Pure. Además de la configuración inicial con Lynxview, hubo que **cambiar el uso de los puertos** para que trabajasen con NVMe over RoCE y no con la configuración básica. Después, crear hosts, grupos y volúmenes, y presentar la SAN a los ESXi.

> ✏️ PENDIENTE: ¿algo que aprendieras de RoCE (configuración de los switches, PFC/ECN, MTU…)? Si no lo tocaste tú, quita esta línea.

## Migrar a los clientes

Lo cuento en otra nota: [Migrar clientes de vSphere 7 a 8 con Veeam](/notas/migrar-clientes-de-vsphere-7-a-8-con-veeam/).

## Resultado

- Más rendimiento por el cambio de CPU y memoria.
- Copias y restauraciones de ficheros más rápidas.
- Un proxy de Veeam con regla de afinidad por host para repartir la carga de backups.

> ✏️ PENDIENTE: ¿alguna cifra de mejora (tiempos de backup antes/después, por ejemplo)? Aunque sea aproximada.
