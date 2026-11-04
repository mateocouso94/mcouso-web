---
title: Un entorno de preproducción que se refresca solo
date: 2026-11-04
summary: "Cada semana, la preproducción de un SaaS en Azure se rellena con los datos de producción: PostgreSQL anonimizado y blob storages sincronizados con AzCopy, desde un bastión que solo puede leer en producción. Y alrededor, el día a día en Azure, AWS y Linux."
tags: [Azure, AWS, Linux, PostgreSQL, Bash, Seguridad]
---

Llevo nueve meses en el equipo de sistemas de un cliente con un **SaaS en Azure**. También trabajo con **AWS**. Mi trabajo es de operación: dar apoyo al equipo de desarrollo, ir a las reuniones con el cliente y mantener los entornos de producción, preproducción, desarrollo y UAT.

El caso que mejor lo resume: una preproducción que cada semana tiene los datos de producción, sin que nadie tenga que copiarlos a mano.

## Por qué

Una preproducción sirve de más cuanto más se parece a producción. Pero copiar producción tal cual no vale, porque hay datos que no deben salir de ahí: por eso se anonimizan.

En este SaaS hay dos cosas que copiar, que entre las dos suman unos **100 GB**:

- La base de datos, en **Azure Database for PostgreSQL**.
- Los ficheros, en **blob storages**.

## Cómo funciona

Todo se ejecuta desde una **máquina bastión** con conectividad con los dos entornos. Desde ahí, cada semana:

1. **Un orquestador en bash** copia la base de datos de producción a preproducción y la **anonimiza**.
2. Cuando termina, **un timer lanza la sincronización de los blob storages** con **AzCopy**. El script de los blobs valida la copia al acabar.

```
bastión
 ├─ lee ─────► PRO  BD + blobs
 └─ escribe ─► PRE  1. BD anonimizada
                    2. blobs, AzCopy
```

Los pasos van encadenados: **si la copia de la base de datos falla o no termina correctamente, los blob storages no se replican**. Así preproducción nunca se queda con una base de datos a medias y unos ficheros que no le corresponden.

## Que nunca se escriba en producción

En un proceso que copia de PRO a PRE, lo delicado es la dirección. Por eso el bastión **solo tiene permiso de lectura en producción**: en preproducción puede escribir, pero sobre la base de datos de producción no puede hacer nada más que leer. Aunque el proceso se lanzase al revés, no se ejecutaría.

## Mínimos permisos, también para las personas

Es la misma idea que aplicamos a los usuarios. Cuando alguien necesita acceso a algo y el rol integrado de Azure le daría **más de lo que necesita**, creamos un **rol con solo los permisos necesarios**.

También revisamos los permisos de usuarios y **Key Vault**, y creamos las claves que hacen falta.

## El resto del trabajo en Azure

- **Application Gateway con WAF**, con reglas personalizadas.
- **Azure Functions**.
- **Copias y restauraciones** de la base de datos.
- **Entornos montados desde cero**, incluidos los de **desarrollo y UAT** con acceso para el cliente, con su certificado de **Let's Encrypt** y los paquetes que necesita la aplicación.

## AWS

- **Security groups** con acceso limitado por puertos y por IP de origen.
- **SSH solo desde nuestra IP**.
- Creación de máquinas y gestión de **snapshots**.
- **AMI al dar de baja una máquina de producción**, para conservar sus datos aunque la instancia desaparezca.

## Linux en el día a día

Debian 10, 11, 12 y 13 y Ubuntu Server 22.04 y 24.04:

- Actualización de paquetes.
- Ampliación de discos.
- Despliegue de contenedores Docker.
- Gestión de procesos.
- Scripts en bash, como el borrado automático de backups antiguos.
- Despliegues y apoyo al equipo de desarrollo.
