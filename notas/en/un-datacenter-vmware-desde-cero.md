---
title: A VMware datacenter from scratch
date: 2026-11-04
summary: "Five Dell hosts with EPYC 9534 and ESXi 8, Pure Storage arrays over NVMe over RoCE instead of iSCSI, and one VDS per customer so as not to drag the standard switches along. The decisions I made and what improved: restoring 1 TB went from about 20 minutes to 7-8."
tags: [VMware, ESXi 8, Pure Storage, NVMe-oF, Networking]
---

A new datacenter was needed to move the customers off the old one, which was on vSphere 7. It fell to me to design and build it, and it's probably the project I've learned the most from.

## What we were after

- **More** compute and storage **power**.
- **Pure Storage arrays**, one for data and another for backups.
- Taking advantage of what **ESXi 8** offers.
- **Not dragging along the standard switches** from the old datacenter, or the problems that came with them.

On top of that, the company wanted **two completely independent datacenters**, in different locations and with no direct connection between them. That's why the new one has **its own vCenter**, instead of extending the existing one.

## The hardware

- **5 new Dell hosts** with 64-core **AMD EPYC 9534** CPUs and **2.25 TB of RAM** per host, in a **single cluster**.
- **Dell switches** at 100 Gb.
- A **Pure Storage array** for data, connected over **NVMe over RoCE**, with 400 Gb.
- A **second Pure array** for backups.

Compared with the old datacenter, the big jump is mostly in the processor: twice the cores and a newer generation.

| | Old datacenter | New datacenter |
|---|---|---|
| Version | ESXi 7 | ESXi 8 |
| Processor | AMD EPYC 7513 (32 cores, Zen 3) | AMD EPYC 9534 (64 cores, Zen 4) |
| RAM per host | 2 TB | 2.25 TB |

## Each host's network

Each host has **7 interfaces**, each with its own role, and everything runs over **separate VLANs with MTU 9000**. The host network design was mine.

| Interface | Speed | Use |
|---|---|---|
| 2 network ports | 10 Gb | Customer traffic out, through Fortinet |
| ConnectX-6 A and B, port 1 | 2 × 100 Gb | **SAN**: NVMe over RoCE, one VLAN per port, Round Robin |
| ConnectX-6 A, port 2 | 100 Gb | **Backup** active, vMotion standby |
| ConnectX-6 B, port 2 | 100 Gb | **vMotion** active, backup standby |
| iDRAC | — | Remote server management |

The four service ports are **two dual-port ConnectX-6 cards**, connected to the 100 Gb switches:

```
ConnectX-6 A
  port 1 → SAN (VLAN 1)        100 Gb
  port 2 → Backup  · active    100 Gb
           vMotion · standby

ConnectX-6 B
  port 1 → SAN (VLAN 2)        100 Gb
  port 2 → vMotion · active    100 Gb
           Backup  · standby
```

There are three decisions behind this layout:

- **The SAN uses one port on each card**, on two different VLANs and with Round Robin across both paths. If a card fails, storage keeps working through the other. In total that's **200 Gb for the SAN**.
- **Backup and vMotion are crossed over.** Each has its active port on a different card and its standby on the other. If a card fails, both services keep working.
- **That way the traffic doesn't mix.** vMotion can't be throttled: when it moves a VM, it uses all the bandwidth it has. If it shared a link with the backups, it would slow them down. With an active port for each, they only share a link if a card fails.

The **Pure array** has 4 ports at 100 Gb, **400 Gb in total**, to serve all five hosts at once. In Veeam there's **one proxy per host**, each pinned to its host with an affinity rule, so the backups go out through each machine's backup link and the load is spread.

The **management network** is kept apart: its own VLAN, the iDRACs separated and access only over **VPN**. Nothing management-related is exposed on the service network.

## One VDS per customer

In the old datacenter, with standard switches, every customer with their own firewall meant manual work: create a trunk port, pass all their VLANs through it, create those VLANs on their Fortinet and remove the customer's permission to create new VLANs. That job was ours, over and over again.

In the new one:

- As a rule, **each customer has their own VDS**.
- Customers who need more have their own **virtual Fortinet**, with its port group and only the VLANs they need.

It was the best solution we found, and it let us start clean without inheriting the old datacenter's problems.

## Before installing anything: the compatibility matrix

Before touching an ESXi I went through the part nobody sees: VMware's compatibility matrix, the remote management firmware versions, the BIOS, the drivers and a custom ESXi 8 image for that hardware. With NVMe over RoCE this isn't optional: if the card, the driver and the firmware don't line up, there's no storage.

Everything was updated following the matrix, and **everything worked**, with no incompatibilities at all.

## The array: NVMe over RoCE instead of iSCSI

I did the array initialisation myself, working with Pure. The most important part was configuring it to use **NVMe over RoCE** (NVMe over Ethernet with RDMA) instead of the usual **iSCSI**. Besides the initial setup with Lynxview, that meant changing how the array's ports were used. After that: creating hosts, groups and volumes, and presenting the SAN to the ESXi hosts.

The reason was performance: NVMe over RoCE gives lower latency and higher throughput than iSCSI.

## Result

- More performance from the change of CPU, memory and storage.
- **Restoring a 1 TB backup went from about 20 minutes to 7-8 minutes**. These are approximate times.

How we moved the customers to the new datacenter is in [Migrating customers from vSphere 7 to 8 with Veeam](/en/notes/migrar-clientes-de-vsphere-7-a-8-con-veeam/).
