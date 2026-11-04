---
title: Un DR con Veeam 13, probado de verdad
date: 2026-11-04
summary: "Veeam CDP entre la infraestructura de un cliente y la nuestra: RPO de 15 minutos para las máquinas críticas, RTO de 3 horas, un día entero de pruebas y un manual para que el cliente no dependa de nosotros."
tags: [Veeam, DR, CDP, DNS, VMware]
---

Un plan de recuperación ante desastres que no se ha probado es solo un documento. En este proyecto el objetivo era montar un DR entre la infraestructura **on-premise de un cliente** y la nuestra, y **demostrar que funcionaba**.

## El alcance

- **Veeam 13 con CDP** (Continuous Data Protection), solo para este cliente.
- **10 máquinas virtuales**, desde unos pocos GB hasta **2-3 TB**.
- Destino: nuestra infraestructura, en una VLAN de recuperación propia.

| | Máquinas críticas | Máquinas menos críticas |
|---|---|---|
| **RPO** (cuántos datos se pueden perder) | 15 minutos | 1 hora |
| **RTO** (cuánto se tarda en volver a funcionar) | 3 horas | 3 horas |

## Lo primero: todo iba por IP

Al revisar la infraestructura del cliente vi que **todo funcionaba por dirección IP**, sin DNS. Para Veeam y sus certificados eso no vale, así que antes de replicar nada tuve que desplegar DNS:

- Creé las **zonas DNS** con sus registros.
- Cambié las configuraciones para pasar de IP a **nombres**.

No dio problemas, pero era trabajo previo que no aparecía en el plan inicial.

## El despliegue

Desplegué los componentes y los **proxies de Veeam 13** y los **certificados**, y configuré las copias, el destino y la VLAN de recuperación.

## Permisos: el cliente solo ve lo suyo

El cliente necesitaba acceso a sus máquinas en nuestro vCenter, pero a nada más. Lo resolví con un **rol personalizado** en el que todo está oculto salvo el estado de sus máquinas. Con ese rol solo puede:

- Ver y listar sus máquinas.
- Encenderlas, apagarlas y reiniciarlas.
- Abrir la consola remota.

No ve hosts, ni redes, ni datastores, ni puede cambiar nada más.

## La prueba

Las pruebas duraron **un día entero**:

1. Se levantaron las copias en nuestra infraestructura, en **alrededor de una hora**.
2. Con el equipo de redes, se cambió lo necesario en los **Fortinet** para que el tráfico llegase al entorno recuperado. A partir de ahí, las máquinas estuvieron accesibles enseguida.
3. Se validó el **acceso de los usuarios**, la **lectura de ficheros** y el resto de comprobaciones.

Todo salió bien.

## Un manual para no depender de nosotros

El último entregable fue un **procedimiento escrito** para que el cliente pudiera ejecutar la recuperación sin depender de nosotros.

También lo conté en [LinkedIn](https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf).
