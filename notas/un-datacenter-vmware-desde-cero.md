---
title: Un datacenter VMware desde cero
date: 2026-11-04
summary: "Cinco hosts Dell con EPYC 9534 y ESXi 8, cabinas Pure Storage por NVMe over RoCE en lugar de iSCSI y un VDS por cliente para no arrastrar los standard switches. Las decisiones que tomé y lo que mejoró: restaurar 1 TB pasó de unos 20 minutos a 7-8."
tags: [VMware, ESXi 8, Pure Storage, NVMe-oF, Redes]
---

Hacía falta un datacenter nuevo al que mover los clientes del antiguo, que estaba en vSphere 7. Me tocó diseñarlo y montarlo, y es probablemente el proyecto del que más he aprendido.

## Qué se buscaba

- **Más potencia** de cómputo y almacenamiento.
- **Cabinas Pure Storage**, una para los datos y otra para los backups.
- Aprovechar las ventajas de **ESXi 8**.
- **No arrastrar los standard switches** del datacenter antiguo, ni los problemas que traían.

Además, la empresa quería **dos datacenters completamente independientes**, en ubicaciones distintas y sin conexión directa entre ellos. Por eso el nuevo tiene **su propio vCenter**, en lugar de ampliar el que ya había.

## El hardware

- **5 hosts Dell nuevos** con **AMD EPYC 9534** de 64 núcleos y **2,25 TB de RAM** por host, en un **único clúster**.
- **Switches Dell** a 100 Gb.
- **Cabina Pure Storage** para los datos, conectada por **NVMe over RoCE**, con 400 Gb.
- **Segunda cabina Pure** para las copias.

Frente al datacenter antiguo, el salto está sobre todo en el procesador: el doble de núcleos y una generación más nueva.

| | Datacenter antiguo | Datacenter nuevo |
|---|---|---|
| Versión | ESXi 7 | ESXi 8 |
| Procesador | AMD EPYC 7513 (32 núcleos, Zen 3) | AMD EPYC 9534 (64 núcleos, Zen 4) |
| RAM por host | 2 TB | 2,25 TB |

## La red de cada host

Cada host tiene **7 interfaces**, cada una con su función, y todo va por **VLAN separadas con MTU 9000**. El diseño de red de los hosts fue mío.

| Interfaz | Velocidad | Uso |
|---|---|---|
| 2 puertos de red | 10 Gb | Salida de los clientes, vía Fortinet |
| ConnectX-6 A y B, puerto 1 | 2 × 100 Gb | **SAN**: NVMe over RoCE, una VLAN por puerto, Round Robin |
| ConnectX-6 A, puerto 2 | 100 Gb | **Backup** activo, vMotion en espera |
| ConnectX-6 B, puerto 2 | 100 Gb | **vMotion** activo, backup en espera |
| iDRAC | — | Gestión remota del servidor |

Los cuatro puertos de servicio son **dos tarjetas ConnectX-6 de doble puerto**, conectadas a los switches de 100 Gb:

```
ConnectX-6 A
  puerto 1 → SAN (VLAN 1)      100 Gb
  puerto 2 → Backup  · activo  100 Gb
             vMotion · espera

ConnectX-6 B
  puerto 1 → SAN (VLAN 2)      100 Gb
  puerto 2 → vMotion · activo  100 Gb
             Backup  · espera
```

Hay tres decisiones detrás de este reparto:

- **La SAN usa un puerto de cada tarjeta**, en dos VLAN distintas y con Round Robin entre los dos caminos. Si cae una tarjeta, el almacenamiento sigue funcionando por la otra. En total son **200 Gb para la SAN**.
- **Backup y vMotion van cruzados.** Cada uno tiene su puerto activo en una tarjeta distinta y el de reserva en la otra. Si cae una tarjeta, los dos servicios siguen funcionando.
- **Así no se mezcla el tráfico.** vMotion no se puede limitar: cuando mueve una máquina, usa todo el ancho de banda que tiene. Si compartiese enlace con los backups, los frenaría. Con un puerto activo para cada uno, solo comparten enlace si falla una tarjeta.

La **cabina Pure** tiene 4 puertos de 100 Gb, **400 Gb en total**, para atender a los cinco hosts a la vez. En Veeam hay **un proxy por host**, cada uno fijado a su host con una regla de afinidad, para que las copias salgan por el enlace de backup de cada máquina y la carga se reparta.

La **red de gestión** va aparte: su propia VLAN, las iDRAC separadas y acceso solo por **VPN**. Nada de gestión expuesto en la red de servicio.

## Un VDS por cliente

En el datacenter antiguo, con standard switches, cada cliente con firewall propio era un trabajo manual: crear un puerto trunk, pasarle todas sus VLAN, crear esas VLAN en su Fortinet y quitarle al cliente los permisos para crear VLAN nuevas. Esa tarea la hacíamos nosotros, una y otra vez.

En el nuevo:

- Por norma, **cada cliente tiene su propio VDS**.
- Los clientes que necesitan más tienen su **Fortinet virtual**, con su port group y solo las VLAN que necesitan.

Fue la mejor solución que encontramos, y nos permitió empezar limpios sin heredar los problemas del datacenter anterior.

## Antes de instalar nada: la matriz de compatibilidad

Antes de tocar un ESXi pasé por la parte que nadie ve: la matriz de compatibilidad de VMware, las versiones de firmware de la gestión remota, la BIOS, los drivers y una imagen de ESXi 8 personalizada para ese hardware. Con NVMe over RoCE esto no es opcional: si la tarjeta, el driver y el firmware no cuadran, no hay almacenamiento.

Todo se actualizó siguiendo la matriz, y **todo funcionó**, sin ninguna incompatibilidad.

## La cabina: NVMe over RoCE en lugar de iSCSI

La inicialización de la cabina la hice yo, en contacto con Pure. Lo más importante fue configurarla para usar **NVMe over RoCE** (NVMe sobre Ethernet con RDMA) en lugar del habitual **iSCSI**. Además de la configuración inicial con Lynxview, eso implicó cambiar el uso de los puertos de la cabina. Después, crear hosts, grupos y volúmenes y presentar la SAN a los ESXi.

El motivo era el rendimiento: NVMe over RoCE da menos latencia y más velocidad que iSCSI.

## Resultado

- Más rendimiento por el cambio de CPU, memoria y almacenamiento.
- **Restaurar un backup de 1 TB pasó de unos 20 minutos a 7-8 minutos**. Son tiempos aproximados.

Cómo movimos a los clientes al datacenter nuevo lo cuento en [Migrar clientes de vSphere 7 a 8 con Veeam](/notas/migrar-clientes-de-vsphere-7-a-8-con-veeam/).
