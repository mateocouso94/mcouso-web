---
title: Mi Cloudflare en Terraform, sin tocar nada
date: 2026-11-24
summary: "Pasé a Terraform el túnel y los DNS de esta web, que llevaban semanas funcionando y configurados a mano. La regla era no cambiar nada en Cloudflare: importar, comprobar que el plan sale vacío y solo entonces empezar a gestionarlo como código."
tags: [Terraform, Cloudflare, IaC, Backblaze B2, Homelab]
---

Esta web llega a internet por un [túnel de Cloudflare](/notas/como-se-despliega-esta-web/). El túnel, sus rutas y los registros DNS los había creado a mano en el panel, y funcionaban bien. El problema es que la única documentación de cómo estaban configurados era el propio panel.

Lo noté de verdad cuando monté la [réplica de reserva](/notas/que-un-corte-de-luz-no-tumbe-la-web/): cambié la ruta del túnel desde el panel y, durante un rato, las visitas a homelab dieron error. No había forma de revisar el cambio antes de hacerlo ni de ver después qué había tocado.

Terraform resuelve eso: la configuración vive en un repositorio, cada cambio se revisa con un `plan` antes de aplicarse y el historial de git dice qué cambió y cuándo. Era además el siguiente paso que me había puesto para el homelab.

## La regla: importar sin cambiar nada

La web estaba en producción, así que la primera fase tenía una sola regla: **Terraform tenía que adoptar lo que ya existía sin modificar nada**.

En la práctica, eso significa importar cada recurso al estado de Terraform y exigir que el plan diga exactamente esto:

```
Plan: 4 to import, 0 to add, 0 to change, 0 to destroy.
```

Si aparecía cualquier `change` o `destroy`, se corregía el código hasta que desapareciera. Nunca se aplicaba un plan que tocara algo. Fueron cuatro recursos: el túnel, su configuración (las rutas) y los dos registros DNS, el del dominio y el de `www`.

Para no escribir el código a mano usé `cf-terraforming`, la herramienta oficial de Cloudflare. Lee lo que hay en tu cuenta y genera el código de Terraform y los bloques `import`.

## Dónde vive cada cosa

| Qué | Dónde | Por qué |
|---|---|---|
| Código | repositorio privado en GitHub | revisión con PR e historial |
| Estado | un bucket de Backblaze B2 | fuera de git y con todas sus versiones |
| Credenciales | un fichero en el servidor y mi gestor de contraseñas | nunca en el repositorio |
| Ejecución | el mini PC de monitorización | siempre encendido, dentro de casa |

**El estado no va a git.** Es el fichero donde Terraform apunta lo que gestiona, y puede contener datos sensibles. Lo guardo en B2, donde ya tenía las [copias del homelab](/notas/copias-3-2-1-0/), pero en un bucket aparte, privado y con versiones: si algo sale mal, puedo volver a cualquier estado anterior. B2 es compatible con la API de S3, así que Terraform lo usa con su backend `s3` y unos cuantos ajustes, porque la compatibilidad no es total.

**El token, con lo mínimo.** El token de Cloudflare solo puede editar los DNS de este dominio, leer la zona y gestionar túneles. Nada más. Es el mismo criterio de permisos mínimos que aplico a diario en Azure y AWS, y no tenía sentido saltármelo en casa.

## Los tropiezos

Nada de esto salió a la primera, y los fallos son lo más útil de contar:

- **`cf-terraforming` se descargó su propio Terraform.** Como no le indiqué dónde estaba el que ya tenía instalado, bajó una copia de 123 MB en la carpeta del proyecto, y mi `git add -A` la metió en el commit. GitHub la rechazó por tamaño. Como el commit no había llegado a subirse, lo rehíce sin el binario y lo añadí al `.gitignore`.
- **Un parámetro con formato propio.** Para la configuración del túnel, la herramienta pide el ID como `tipo=ID`, no el ID solo.
- **Un import que la herramienta no sabe hacer.** Genera el código de la configuración del túnel, pero no su bloque `import`. Ese lo escribe a mano el script de importación.

Ninguno de estos fallos podía romper la web, y ese era el objetivo de la regla: mientras el plan no sale limpio, no se aplica nada.

## Del código generado a código legible

El código que genera `cf-terraforming` funciona, pero no se lee bien: recursos con nombres como `terraform_managed_resource_43c1…` y el ID del túnel copiado en varios sitios. En un segundo paso lo reescribí en un único fichero:

```hcl
locals {
  origen    = "http://origen-web:3000"
  hostnames = ["www.mcouso.es", "mcouso.es"]
}

resource "cloudflare_dns_record" "web" {
  for_each = toset(local.hostnames)

  zone_id = var.zone_id
  name    = each.value
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.web.id}.cfargotunnel.com"
  proxied = true
  ttl     = 1
}
```

- **Una lista de nombres genera a la vez los registros DNS y las rutas del túnel.** Para publicar un subdominio nuevo, añado una línea y Terraform crea las dos cosas, sin que se me olvide ninguna.
- **Los DNS apuntan al túnel por referencia**, no con su ID copiado.
- **Bloques `moved`** para pasar de los nombres generados a los nuevos sin recrear nada. El plan volvió a salir sin cambios.
- **El túnel no se puede borrar desde Terraform** (`prevent_destroy`): lo usan tanto homelab como la réplica.

Como el resto del homelab, el código lo escribí con ayuda de IA. Las decisiones, la revisión de cada plan y la ejecución fueron mías.

## Lo que viene

- **Los ajustes de seguridad de la zona:** SSL estricto, HSTS y TLS 1.2 como mínimo. Será el primer cambio real hecho con Terraform, y esta vez el plan sí tendrá cambios que revisar.
- **Llevar a código otras partes del homelab**, empezando por lo que hoy solo está documentado en el panel de cada servicio.
