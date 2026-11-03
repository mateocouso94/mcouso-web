---
title: De SAN a vSAN sin cambiar las redes
date: 2026-11-03
summary: Cómo pasamos un clúster de siete hosts con versiones mezcladas de una cabina Dell a vSAN, por fases y en caliente, sin tocar las VLAN de los clientes.
tags: [VMware, vSAN, vSphere, Migración]
draft: true
---

> ✏️ PENDIENTE: revisa todo el texto y quita estos avisos antes de publicar. Para publicar, borra la línea `draft: true` de arriba.

## El punto de partida

Un clúster de siete hosts con el almacenamiento en una cabina Dell compartida. Y con un problema añadido: no todos los hosts estaban en la misma versión. Cuatro seguían en vSphere 6.5 y tres en 7.0.

El objetivo era quitar la dependencia de la cabina y pasar a vSAN con discos locales. La condición era clara: **no tocar las redes de los clientes**. Mismas redes, mismas VLAN, nada que reconfigurar por su lado.

> ✏️ PENDIENTE: ¿por qué se decidió ir a vSAN? (¿fin de soporte de la cabina, coste, rendimiento, capacidad?) Una frase basta.

## Por qué por fases

No había forma de parar el clúster entero, así que la única opción era ir moviendo la carga poco a poco. La carga que había permitía empezar con solo tres hosts, y eso marcó el plan:

1. Añadir discos locales a los hosts.
2. Coger **tres hosts**, actualizarlos y montar la vSAN con ellos.
3. Empezar a mover máquinas a la vSAN.
4. Cada host que quedaba libre se actualizaba y entraba en la vSAN.
5. Repetir hasta completar el clúster nuevo en **7.0.3**.

> ✏️ PENDIENTE: ¿cuánto tiempo llevó todo? ¿Semanas, meses? ¿Cuántas máquinas se movieron aproximadamente?

## Migrar en caliente sin vCenter

El clúster de origen no estaba gestionado por el vCenter, así que no podía tirar de vMotion normal entre clústeres. Las migraciones en caliente se hicieron con **replicación**: la máquina se replicaba al destino mientras seguía funcionando, y solo había un corte breve al finalizar la replicación.

> ✏️ PENDIENTE: ¿con qué herramienta se replicó? (¿vSphere Replication, Veeam Replication…?) ¿Cuánto duraba el corte final de cada máquina, más o menos?

## Lo que dio guerra: los Distributed Switches

Los VDS se habían creado en su día con la versión 6.5, y con hosts en 7.0 había que actualizarlos a **7.0.3**. Es de esas cosas que no aparecen en el plan inicial y que hay que resolver por el camino sin romper la conectividad de nadie.

> ✏️ PENDIENTE: ¿cómo lo resolviste? ¿Se actualizaron en una ventana concreta, hubo que recrear algo, algún problema con los uplinks?

## Resultado

- Clúster nuevo sobre vSAN, todos los hosts en 7.0.3.
- Las redes y VLAN de los clientes no cambiaron en ningún momento.
- Las únicas paradas fueron las cortas, al finalizar cada replicación.

> ✏️ PENDIENTE: ¿qué harías distinto si lo repitieras? Esto es lo que más valor le da a una nota así.
