---
title: Un datacenter VMware desde cero
date: 2026-11-04
summary: "Cinco hosts Dell con ESXi 8, cabinas Pure Storage por NVMe over RoCE en lugar de iSCSI y un VDS por cliente para no arrastrar los standard switches. Las decisiones que tomé y lo que mejoró: restaurar 1 TB pasó de unos 20 minutos a 7-8."
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

- **5 hosts Dell nuevos** con AMD EPYC de 64 núcleos, en un **único clúster**.
- **Switches Dell** a 100 Gb.
- **Cabina Pure Storage** para los datos, conectada por **NVMe over RoCE**, con 400 Gb.
- **Segunda cabina Pure** para las copias.

## La red: separar todo

Cada host tiene:

| Uso | Ancho de banda |
|---|---|
| SAN (NVMe over RoCE) | 200 Gb |
| vMotion | 200 Gb |
| Salida a Internet (vía Fortinet) | 10 Gb |

La **red de gestión** va aparte: su propia VLAN, consolas de los servidores separadas y acceso solo por **VPN**. Nada de gestión expuesto en la red de servicio.

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
- Un proxy de Veeam con regla de afinidad por host para repartir la carga de copias y restauraciones.

Cómo movimos a los clientes al datacenter nuevo lo cuento en [Migrar clientes de vSphere 7 a 8 con Veeam](/notas/migrar-clientes-de-vsphere-7-a-8-con-veeam/).
