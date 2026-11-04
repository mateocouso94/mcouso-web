---
title: Migrar clientes de vSphere 7 a 8 con Veeam
date: 2026-11-04
summary: "Dos datacenters sin conexión directa entre ellos, así que nada de vMotion: backup completo con Veeam el día antes, incrementales el día del cambio y unos 20-30 minutos de corte por cliente. El almacenamiento bajó del 85-90 % al 60 %."
tags: [VMware, Veeam, Migración, vSphere 8]
---

Con el [datacenter nuevo](/notas/un-datacenter-vmware-desde-cero/) montado, quedaba lo importante: mover a los clientes desde el entorno antiguo en vSphere 7. No máquinas sueltas, sino **clientes completos**, cada uno con sus redes y su segmentación.

## Por qué Veeam y no vMotion

La empresa quería **dos datacenters completamente independientes**, sin conexión directa entre ellos: ni puertos ni rutas. Sin esa conexión, Cross vCenter vMotion no era una opción. La solución fue **Veeam**: copiar en un lado y restaurar en el otro.

## El método

1. **Un día antes**, un backup completo de todas las máquinas del cliente, que se transfería al datacenter nuevo.
2. **El día del cambio**, backups incrementales para que la última copia fuese lo más pequeña posible.
3. Fuera de horario, el corte: el último incremental, la restauración en el datacenter nuevo **en una VLAN nueva** y los ajustes en vCenter para dejar al cliente igual que estaba.
4. Respetando siempre su segmentación: su VDS y, si lo tenía, su Fortinet.

El corte medio fue de **20-30 minutos** por cliente. Las ventanas se planificaban **directamente con cada cliente**, eligiendo las horas que mejor le encajaban.

## Decidir quién va y cuándo

Esta parte era mía: **elegir qué clientes se migraban, en qué orden y cuándo**, y ejecutarlo.

El criterio fue el **tamaño de las máquinas y la carga que soportaba el datacenter antiguo**. El objetivo era quitarle presión cuanto antes:

- **Almacenamiento**: aunque usábamos thin provisioning, estábamos en un **85-90 %** de ocupación. Con la migración bajó al **60 %**.
- **Cómputo**: antes era difícil tener un host en mantenimiento en horas punta. Después, el entorno aguanta **un host en mantenimiento y la caída de otro** a la vez.

## Después de migrar

Algunos clientes pasaron además a **Cloud Director**. Y para que los backups del entorno nuevo no se concentrasen en un único host, añadí un **proxy de Veeam con regla de afinidad por host**, repartiendo la carga de copias y restauraciones.
