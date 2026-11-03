---
title: Un rack de cloud multi-cliente, de arriba abajo
date: 2026-11-03
summary: Firewalls, tres redes separadas, dos cabinas, un fabric de 100G y hosts ESXi 8 con Cloud Director encima. Qué va en cada altura del rack y por qué.
tags: [VMware, ESXi 8, Cloud Director, Fortinet, CPD]
draft: true
---

> ✏️ PENDIENTE: revisa todo el texto y quita estos avisos antes de publicar. Para publicar, borra la línea `draft: true`.

Un rack bien montado se lee de arriba abajo como un diagrama de red: por dónde entra el tráfico, dónde se separa, dónde se guarda y dónde se ejecuta. Este es un rack de colocation que monté para una plataforma cloud multi-cliente: **ESXi 8 y vCenter 8** por debajo, **Cloud Director** por encima para que cada cliente tenga su parte, y **firewalls Fortinet** tanto físicos como virtuales.

No voy a enseñar fotos ni datos de la instalación real, pero sí el esquema, que es lo que importa.

![Alzado frontal de un rack de 48U: firewalls arriba, switches de gestión y de clientes, reserva, dos cabinas de almacenamiento, cinco switches de 100G, reserva con paneles ciegos y tres hosts abajo. Dos PDU, A y B, a los lados.](/img/notas/rack-cloud-multicliente.svg)

*Esquema simplificado del rack. Cada equipo tiene una fuente en la PDU A y otra en la B.*

## El orden no es casual

**Lo pesado, abajo.** Los hosts y, en general, lo que más pesa van en las U bajas. El rack es más estable y no hay que levantar un servidor por encima de la cabeza para enracarlo.

**El perímetro, arriba.** Los firewalls van en lo alto, cerca de donde llegan las acometidas del operador. El tráfico de Internet entra, pasa el firewall y baja al resto del rack.

**El almacenamiento y el fabric, juntos.** Las cabinas están justo encima de los switches de 100G, y los hosts conectan a esos mismos switches. Así los latiguillos DAC son cortos (estos cables no admiten tiradas largas) y la ruta entre almacenamiento y cómputo pasa por el menor número de saltos posible.

**Hueco para crecer donde hace falta.** Hay reserva en dos sitios: unas pocas U entre la red y el almacenamiento, y un bloque grande encima de los hosts. Los hosts crecen hacia arriba sin mover nada de lo que ya está en producción.

> ✏️ PENDIENTE: ¿por dónde entraba la fibra del operador, por arriba (bandeja) o por el suelo? ¿Lo de dejar reserva fue decisión tuya o del diseño inicial?

## Todo va en pareja

Ningún elemento del rack es único:

- **Dos firewalls** en alta disponibilidad (activo-pasivo).
- **Dos switches de gestión** y **dos switches de red de clientes**.
- **Cabinas con doble controladora** y cada host con conexiones a más de un switch del fabric.
- **Dos fuentes de alimentación** en cada equipo.

La pregunta que guía todo es siempre la misma: *si quito esto, ¿se cae algo?* La respuesta tiene que ser "no" para cualquier pieza.

> ✏️ PENDIENTE: ¿cómo era la HA de los FortiGate (activo-pasivo, FGCP, enlaces de heartbeat dedicados)? ¿Probasteis el failover antes de entregar?

## Dos líneas eléctricas: A y B

A cada lado del rack hay una PDU, y cada una viene de una línea eléctrica distinta del CPD. Cada equipo lleva **una fuente a la PDU A y la otra a la PDU B**. Si cae una línea entera, todo sigue funcionando con la otra.

Dos detalles que ayudan mucho:

- **Cables de colores**: rojo para la A, azul para la B. De un vistazo ves si alguien ha enchufado las dos fuentes de un equipo a la misma PDU, que es el error típico.
- **Cuidado con la carga**: si una PDU tiene que aguantar todo el rack cuando cae la otra, ninguna puede pasar de la mitad de su capacidad en el día a día.

> ✏️ PENDIENTE: ¿hiciste la prueba de quitar una línea (o apagar una PDU) antes de dar el rack por bueno? ¿Qué consumo tenía el rack?

## Lo que tapa el hueco también cuenta

En un CPD con pasillo frío y pasillo caliente, el aire frío entra por el frontal y sale caliente por detrás. Un hueco sin tapar en el rack deja que el aire caliente vuelva por delante y que los equipos respiren su propio calor.

Por eso todas las U libres llevan **panel ciego**. No es estética: un rack medio vacío sin paneles se calienta más que uno lleno.

## Tres redes que no se tocan

En el rack hay tres conjuntos de switches, y cada uno tiene un trabajo:

| Red | Para qué |
|---|---|
| **Gestión** (1G) | Consolas de los servidores, gestión de cabinas y switches, vCenter. Acceso solo por VPN. |
| **Clientes** | Entrega de servicio a los clientes y enlaces hacia los firewalls. |
| **Fabric 100G** | Almacenamiento, vMotion y tráfico de producción entre hosts. |

Separarlas físicamente, y no solo con VLAN, tiene una ventaja clara: un problema o un error de configuración en una red no puede tumbar las otras. Si se satura el fabric, sigues pudiendo entrar a las consolas.

> ✏️ PENDIENTE: ¿cómo se repartían los cinco switches de 100G (pareja para SAN, pareja para producción, uno de reserva o de interconexión)? ¿MTU 9000 en el fabric?

## Del hierro al cliente

Lo físico es solo la mitad. Encima va la capa que ve el cliente:

1. **Firewalls físicos**: el perímetro de toda la plataforma. Separan Internet de la red de clientes y de la gestión.
2. **vCenter 8 y los hosts ESXi 8**: un clúster con el almacenamiento de las cabinas.
3. **Cloud Director**: reparte ese clúster en organizaciones y VDC, uno por cliente, con sus cuotas de CPU, memoria y almacenamiento.
4. **FortiGate virtual por cliente**: cada cliente que lo necesita tiene su propio firewall virtual, con sus reglas, sus VPN y sus políticas, sin depender de las de nadie más.

El firewall físico protege la plataforma y el virtual protege a cada cliente. Así un cliente puede tener reglas a medida sin que ningún cambio toque a los demás.

> ✏️ PENDIENTE: ¿qué ganabais con el FortiGate virtual frente al Edge de NSX en Cloud Director? Explicar esa decisión le da mucho valor a la nota. ¿Cómo se conectaba el FortiGate virtual de cada cliente con su red en Cloud Director?

## Antes de dar el rack por bueno

La lista que repasaría antes de entregar:

- [ ] Cada equipo con una fuente en la PDU A y otra en la B, comprobado cable a cable.
- [ ] Prueba de corte: apagar una PDU y comprobar que no se cae nada.
- [ ] Failover de los firewalls probado.
- [ ] Quitar un enlace del fabric de cada host y comprobar que el almacenamiento no se pierde.
- [ ] Todos los cables etiquetados en los dos extremos.
- [ ] Paneles ciegos en todas las U libres.
- [ ] Documentación: alzado del rack y mapa de puertos actualizados.

> ✏️ PENDIENTE: ¿alguna de estas pruebas destapó algo? Una anécdota de "esto falló en la prueba y menos mal" es lo mejor que puede tener la nota.
