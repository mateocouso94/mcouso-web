---
title: Migrating customers from vSphere 7 to 8 with Veeam
date: 2026-11-04
summary: "Two datacenters with no direct connection between them, so no vMotion: a full Veeam backup the day before, incrementals on the day and about 20-30 minutes of downtime per customer. Storage went down from 85-90 % to 60 %."
tags: [VMware, Veeam, Migration, vSphere 8]
---

With the [new datacenter](/en/notes/un-datacenter-vmware-desde-cero/) built, the important part was still ahead: moving the customers over from the old vSphere 7 environment. Not individual VMs, but **whole customers**, each with their own networks and segmentation.

## Why Veeam and not vMotion

The company wanted **two completely independent datacenters**, in different locations and with no direct connection between them: no ports, no routes. Without that connection, Cross vCenter vMotion wasn't an option. The solution was **Veeam**: back up on one side and restore on the other.

## The method

1. **The day before**, a full backup of all the customer's VMs, which was transferred to the new datacenter.
2. **On the day of the switch**, incremental backups so the last copy would be as small as possible.
3. Out of hours, the cutover: the last incremental, the restore in the new datacenter **on a new VLAN**, and the vCenter adjustments to leave the customer exactly as they were.
4. Always respecting their segmentation: their VDS and, if they had one, their Fortinet.

Average downtime was **20-30 minutes** per customer. The windows were planned **directly with each customer**, choosing the hours that suited them best.

## Deciding who goes and when

This part was mine: **choosing which customers were migrated, in what order and when**, and carrying it out.

The criterion was **the size of the VMs and the load the old datacenter was carrying**. The goal was to take pressure off it as soon as possible:

- **Storage**: even though we used thin provisioning, we were at **85-90 %** usage. With the migration it went down to **60 %**.
- **Compute**: before, it was hard to put a host into maintenance at peak times. Afterwards, the environment can handle **one host in maintenance and another one failing** at the same time.

## After the migration

Some customers also moved to **Cloud Director**. And so that the backups in the new environment wouldn't all land on a single host, I added a **Veeam proxy with a per-host affinity rule**, spreading the backup and restore load.
