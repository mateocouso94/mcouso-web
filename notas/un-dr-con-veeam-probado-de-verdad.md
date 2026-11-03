---
title: Un DR con Veeam 13, probado de verdad
date: 2026-11-03
summary: Diez máquinas replicadas entre la infraestructura de un cliente y la nuestra. Lo que hubo que arreglar antes (todo iba por IP) y cómo hicimos la prueba real.
tags: [Veeam, DR, CDP, DNS, VMware]
draft: true
---

> ✏️ PENDIENTE: revisa todo el texto y quita estos avisos antes de publicar. Para publicar, borra la línea `draft: true`.

Un plan de recuperación ante desastres que no se ha probado es solo un documento. En este proyecto el objetivo era montar un DR entre la infraestructura de un cliente y la nuestra, y **demostrar que funcionaba**.

## El alcance

- **10 máquinas virtuales**, una de ellas de unos **3 TB**.
- **Veeam 13**, con RPO y RTO definidos **por máquina**.
- Destino: nuestra infraestructura, en una VLAN de recuperación propia.

> ✏️ PENDIENTE: ¿qué RPO/RTO se acordaron, aunque sea en rangos? ¿Era CDP para todas o solo para las críticas?

## Lo primero: todo iba por IP

Al revisar la infraestructura del cliente vi que **todo funcionaba por dirección IP**, sin DNS. Para Veeam y sus certificados eso no vale, así que antes de replicar nada:

- Creé una **zona DNS** con sus registros.
- Pasé la configuración de IP a **nombres**.
- Resolví los problemas que salieron por el camino.

> ✏️ PENDIENTE: ¿qué problemas salieron al pasar a DNS? Uno concreto basta.

## El despliegue

Componentes y **proxies de Veeam 13**, **certificados**, configuración de las copias, del destino y de la VLAN de recuperación.

## Permisos: el cliente solo ve lo suyo

El cliente necesitaba acceso a su parte en nuestro vCenter, pero nada más. Le creé un usuario que **solo veía su carpeta**: ni hosts, ni redes, ni datastores, ni ningún otro cambio posible.

> ✏️ PENDIENTE: ¿cómo lo montaste? (¿rol personalizado, permisos en la carpeta con "propagar", no propagado en el resto?) Esto le interesa mucho a otros técnicos.

## La prueba

Levantamos las máquinas en nuestro lado y **cambiamos las reglas del firewall local** para que el tráfico apuntase a nuestra infraestructura. Las pruebas salieron bien.

> ✏️ PENDIENTE: ¿cuánto tardó en estar operativo el entorno recuperado? ¿Qué se comprobó para darlo por bueno (acceso de usuarios, aplicaciones, la máquina de 3 TB…)?

También lo conté en [LinkedIn](https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf).
