---
title: Copias 3-2-1-0 en mi homelab
date: 2026-11-04
summary: "Tres copias, dos soportes, una fuera de casa y cero errores: copias con restic entre mis dos mini PC y Backblaze B2, y una restauración real cada semana para comprobar que sirven."
tags: [Backup, restic, Backblaze B2, Homelab, Uptime Kuma]
draft: true
---

> ✏️ PENDIENTE: publicar cuando esté funcionando en los dos mini PC. Añade el tamaño real de las copias y lo que cuesta B2 al mes. Para publicar, borra la línea `draft: true`.

En el trabajo he montado copias y DR con Veeam para clientes. En casa no tenía nada: si un disco del homelab moría, perdía la configuración de todo. Así que lo he resuelto con la misma regla que aplicaría en un cliente, a escala de dos mini PC.

## 3-2-1-0

- **3 copias**: los datos originales, una copia en el otro mini PC y otra en Backblaze B2.
- **2 soportes**: los discos de la otra máquina y la nube.
- **1 fuera de casa**: B2, en la región de Ámsterdam.
- **0 errores**: una copia que nunca se ha restaurado no es una copia. Cada semana se restaura de verdad y se comprueba.

El último número es el que casi siempre falta.

## Las piezas

- **restic**: copias cifradas, incrementales y deduplicadas. Un solo binario, instalado en el sistema y no en Docker. El día que haya que restaurar, lo más probable es que Docker sea justo lo que está roto.
- **SFTP enjaulado** entre los mini PC: cada máquina tiene un usuario que solo puede usar SFTP y solo ve su carpeta de copias.
- **Backblaze B2** por la API compatible con S3. Restic cifra todo antes de subirlo: en B2 solo hay bloques cifrados.
- **systemd**: un timer para la copia diaria y otro para la verificación semanal.
- **Uptime Kuma**: un monitor Push por destino y otro para la verificación. Si algo falla, o si simplemente no se ejecuta, me llega un Telegram.

## Bases de datos sin parar servicios

Copiar un fichero SQLite mientras el servicio escribe puede dejar una copia inconsistente. Antes de cada copia, el script hace un volcado en caliente:

```bash
sqlite3 /opt/uptime-kuma/data/kuma.db ".timeout 10000" ".backup '/var/backups/homelab-dumps/kuma.sqlite3'"
```

El volcado es consistente y no hay que parar nada. Esto importa sobre todo en AdGuard: si lo paro, la casa se queda sin DNS.

## El "0": restaurar de verdad

Cada domingo, `verify.sh` hace tres cosas en cada destino:

1. `restic check --read-data-subset 5%`: no solo revisa los índices, también lee y valida un 5 % de los datos reales. En cinco semanas se ha leído todo.
2. Restaura un **canario**: un fichero con un valor aleatorio que la copia escribe cada noche. Si lo restaurado no coincide exactamente con lo escrito, algo va mal.
3. Restaura los volcados de las bases de datos y pasa `PRAGMA integrity_check`.

Si cualquiera de las tres falla, Kuma se pone en rojo.

## Probado antes de llegar al servidor

Los scripts se prueban en GitHub Actions con restic real cada vez que los cambio. La prueba copia, comprueba la retención, verifica y restaura byte a byte. También **corrompe a propósito** un repositorio, para comprobar que la verificación lo detecta, y **elimina** un destino, para comprobar que el otro se sigue copiando.

La prueba encontró un fallo antes de llegar a producción: si pegaba la URL de Kuma tal cual (`...?status=up&msg=OK`), bash interpretaba los `&` y la verificación nunca avisaba.

## Lo que cuesta

> ✏️ PENDIENTE: tamaño real de las copias y coste mensual en B2.

B2 cobra 6,95 $/TB al mes y los primeros 10 GB son gratis. Con la deduplicación, mi homelab cuesta…

El código y la guía de instalación están en [github.com/mateocouso94/mcouso-web/tree/main/infra/backup](https://github.com/mateocouso94/mcouso-web/tree/main/infra/backup). El estado de las copias se ve en directo en [/estado/](/estado/) y con el comando `backup` de la consola.
