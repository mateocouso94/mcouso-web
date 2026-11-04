---
title: Que una actualización de macOS no quite el admin
date: 2026-11-04
summary: "Cada actualización de macOS quitaba a los usuarios el permiso de administrador local. Un script en Intune, aplicado a un grupo de usuarios, lo vuelve a poner solo. Y alrededor, cómo damos de baja un equipo con Intune y M365."
tags: [Intune, macOS, Microsoft 365, Entra ID, Puesto de trabajo]
---

Además de servidores, gestiono los equipos y los usuarios con **Intune**, **Microsoft 365** y **Entra ID**, tanto en un cliente como en nuestro propio tenant. En total son unos **100 usuarios**, con unos **50 equipos Windows** y unos **20 Mac**.

## El problema: el admin que desaparecía

En los Mac, el usuario local se añadía como **administrador del equipo** para tener **trazabilidad**. La integración de directorio en macOS no es demasiado buena, así que no podíamos resolverlo desde ahí.

Funcionaba, pero solo hasta la siguiente actualización de macOS: **las actualizaciones quitaban ese permiso**, y el usuario perdía el acceso de administrador.

## La solución: un script en Intune

Fue idea mía. En lugar de volver a dar el permiso a mano cada vez, lo dejamos en un **script de Intune** que lo aplica solo:

- El script **se asigna en Intune a un grupo de usuarios concreto**. No hay que instalar nada en cada Mac.
- Si el usuario local del Mac **corresponde con el patrón** de los usuarios de ese grupo, el script lo añade como administrador.
- Si una actualización le quita el permiso, el script se lo vuelve a dar.

El resultado: la entrada como administrador quedó **automatizada**, y las actualizaciones de macOS dejaron de dejar a nadie sin acceso.

## Dar de baja un equipo

Cuando alguien deja la empresa, su equipo se prepara para la siguiente persona con un procedimiento fijo:

1. **Dar de baja al usuario.**
2. **Quitarle las licencias de Microsoft 365.**
3. **Lanzar un wipe desde Intune**, que formatea el equipo y lo libera para un usuario nuevo.

## Licencias y permisos

- **Licencias asignadas por grupos** en lugar de usuario a usuario.
- Gestión de **permisos y usuarios en Entra ID** y en Microsoft 365.
