---
title: Copias 3-2-1-0 en mi homelab
date: 2026-11-04
summary: "Tres copias, dos soportes, una fuera de casa y cero errores: copias con restic entre mis dos mini PC y Backblaze B2, y una restauración real cada semana para comprobar que sirven."
tags: [Backup, restic, Backblaze B2, Homelab, Uptime Kuma]
---

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

## Lo que me encontré al instalarlo

Los scripts estaban probados, pero los servidores reales siempre tienen sorpresas:

- **Datos de Docker en el NVMe.** Kuma, Grafana y Prometheus guardaban sus datos en volúmenes de Docker dentro de `/var/lib/docker`, en el disco del sistema. Si ese disco moría, se iban con él. Los pasé a carpetas junto a cada `compose`, dentro de `/opt` en el SSD. Ahora, si cambio el NVMe, reinstalo, monto el SSD y hago `docker compose up -d`.
- **La jaula SFTP exige root.** SSH aceptaba la clave y cortaba la conexión al instante. El motivo era que `ChrootDirectory` exige que todas las carpetas del camino (`/`, `/opt`, `/opt/backups`) sean de root y que nadie más pueda escribir en ellas, y `/opt` era de mi usuario.
- **No todo lo que acaba en `.db` es SQLite.** Los `stats.db` y `sessions.db` de AdGuard son BoltDB, así que no se pueden volcar con `sqlite3`. Se copian como ficheros normales.
- **Capas de Docker que no hacía falta copiar.** En la otra máquina, `/opt` tenía 11 GB de capas de imágenes y caché de compilación. Se vuelven a descargar solas, así que solo copio lo que tiene valor: `/opt/ci` y `/etc`.
- **Las URL de Kuma, por IP.** Kuma daba las URL de los avisos con un nombre que solo resuelve mi AdGuard. Si AdGuard se cae, el aviso no llega justo cuando más falta hace.

## Lo que cuesta

| Máquina | Datos copiados | Ocupado en cada destino | Primera copia a B2 |
|---|---|---|---|
| homelab-red | 361 MiB | 115 MiB | 7 s |
| homelab | 53 MiB | 10 MiB | 4 s |

Restic comprime y deduplica: los 414 MiB de datos ocupan unos 125 MiB en B2. Las copias de cada noche solo suben lo que ha cambiado. B2 cobra 6,95 $/TB al mes y **los primeros 10 GB son gratis**, así que ahora mismo esto me cuesta **0 €**.

La primera verificación restauró desde los cuatro destinos y comprobó el canario y las dos bases de datos de homelab-red. Todo correcto.

El código y la guía de instalación están en [github.com/mateocouso94/mcouso-web/tree/main/infra/backup](https://github.com/mateocouso94/mcouso-web/tree/main/infra/backup). El estado de las copias se ve en directo en [/estado/](/estado/) y con el comando `backup` de la consola.
