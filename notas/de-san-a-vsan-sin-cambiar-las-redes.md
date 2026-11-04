---
title: De SAN a vSAN sin cambiar las redes
date: 2026-11-04
summary: "Un clúster de siete hosts con versiones mezcladas, una cabina antigua con discos HDD y la condición de no tocar las redes de los clientes. Cómo lo pasamos a vSAN all-flash en un mes, por fases, con cortes de unos 10 minutos por máquina."
tags: [VMware, vSAN, vSphere, Migración]
---

## El punto de partida

Un clúster de siete hosts con el almacenamiento en una cabina Dell compartida. La cabina era antigua y tenía discos HDD, así que se decidió pasar a una solución **all-flash con vSAN**, con discos locales en los hosts.

Además, no todos los hosts estaban en la misma versión: cuatro seguían en vSphere 6.5 y tres en 7.0.

La condición era clara: **no tocar las redes de los clientes**. Mismas redes, mismas VLAN, nada que reconfigurar por su lado.

## El plan: por fases

No se podía parar el clúster entero, así que la única opción era mover la carga poco a poco. La carga que había permitía empezar con solo tres hosts, y eso marcó el plan:

1. Añadir discos locales a los hosts.
2. Coger **tres hosts**, actualizarlos y montar la vSAN con ellos.
3. Mover las máquinas a la vSAN.
4. Cada host que quedaba libre se actualizaba y entraba en la vSAN.
5. Repetir hasta completar el clúster nuevo en **7.0.3**.

Instalar y configurar cada host llevaba **alrededor de una hora**.

## Mover las máquinas

Con los tres primeros hosts en vSAN y añadidos al clúster, usamos **vSphere Replication** para llevar cada máquina al nuevo datastore mientras seguía funcionando.

Cuando la réplica estaba completa y el cliente había aprobado la ventana de corte, se hacía el cambio y se validaban los últimos cambios. El corte dependía de cuánto hubiera cambiado desde la última sincronización, pero normalmente era de **unos 10 minutos** por máquina.

En total se movieron las **20 máquinas** del clúster. El proyecto, una vez montados los hosts, duró **un mes**. Ese mes incluye medir los tiempos de parada posibles, elegir los momentos de baja carga de cada máquina, instalar, configurar y migrar.

## Lo que dio guerra: los Distributed Switches

Los VDS tenían que funcionar a la vez con hosts en 6.5 y en 7.0.3, y **no nos dejaba migrar en caliente de un VDS 6.5 a uno 7.0.3**. La solución fue crear los VDS **en versión 6.5**, compatibles con todos los hosts durante la migración. Cuando todos los hosts estuvieron en 7.0.3, se actualizaron los VDS. **La actualización no tuvo ningún corte.**

## Resultado

- Clúster nuevo sobre vSAN all-flash, con todos los hosts en 7.0.3.
- Las redes y VLAN de los clientes no cambiaron en ningún momento.
- Las únicas paradas fueron las de unos 10 minutos al cambiar cada máquina, en ventanas aprobadas por el cliente.

Salió bastante bien: incluso la actualización de los VDS se hizo sin ningún corte.
