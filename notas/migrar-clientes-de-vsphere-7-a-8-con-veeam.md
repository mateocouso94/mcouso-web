---
title: Migrar clientes de vSphere 7 a 8 con Veeam
date: 2026-11-03
summary: Más de 100 clientes movidos al datacenter nuevo. Por qué usé backups completos de Veeam en lugar de vMotion, y cómo decidía quién iba y cuándo.
tags: [VMware, Veeam, Migración, vSphere 8]
draft: true
---

> ✏️ PENDIENTE: revisa todo el texto y quita estos avisos antes de publicar. Para publicar, borra la línea `draft: true`.

Con el [datacenter nuevo](/notas/un-datacenter-vmware-desde-cero/) montado, quedaba lo importante: mover a los clientes desde el entorno antiguo en vSphere 7. No máquinas sueltas, sino **clientes completos**, cada uno con sus redes y su segmentación.

## El método: backup completo y restauración

La mayoría de las migraciones las hice con un **full backup de Veeam** restaurado en el entorno nuevo:

1. Backup completo de las máquinas del cliente.
2. Restauración en el datacenter nuevo, **en una VLAN nueva**.
3. Ajustes en el vCenter para dejar al cliente igual que estaba.
4. Respetando siempre su segmentación: su VDS y, si lo tenía, su Fortinet.

> ✏️ PENDIENTE: ¿por qué backup y restauración en lugar de Cross vCenter vMotion? (¿versiones, red entre CPDs, aprovechar para dejar la VLAN limpia?) Es la decisión clave de la nota.

## Decidir quién va y cuándo

Esta parte era mía: **elegir qué clientes se migraban, en qué orden y cuándo**, y ejecutarlo.

> ✏️ PENDIENTE: ¿qué criterio seguías? (¿tamaño, criticidad, ventanas acordadas con el cliente, empezar por los internos?) ¿Cómo se avisaba al cliente y cuánto duraba el corte?

## Después de migrar

Algunos clientes pasaron además a **Cloud Director**. Y para que los backups del entorno nuevo no se concentrasen en un único host, añadí un **proxy de Veeam con regla de afinidad por host**, repartiendo la carga de copias y restauraciones.

## En números

- Más de **100 clientes** creados, administrados o migrados.
- Alrededor de **1.000 máquinas virtuales** en servicio 24/7.

> ✏️ PENDIENTE: ¿algún cliente que diera más guerra de lo normal y por qué? Sin nombres.
