---
title: From SAN to vSAN without changing the networks
date: 2026-11-04
summary: "A seven-host cluster with mixed versions, an old array with HDDs and one condition: don't touch the customers' networks. How we moved it to all-flash vSAN in a month, in phases, migrating the VMs live with Cross vCenter vMotion."
tags: [VMware, vSAN, vSphere, Migration]
---

## The starting point

A seven-host cluster with its storage on a shared Dell array. The array was old and had HDDs, so the decision was to move to an **all-flash vSAN** solution, with local disks in the hosts.

On top of that, the hosts weren't all on the same version: four were still on vSphere 6.5 and three on 7.0.

The condition was clear: **don't touch the customers' networks**. Same networks, same VLANs, nothing to reconfigure on their side.

## The plan: in phases

Stopping the whole cluster wasn't an option, so the only way was to move the load bit by bit. The existing load allowed us to start with just three hosts, and that shaped the plan:

1. Add local disks to the hosts.
2. Take **three hosts**, upgrade them and build the vSAN with them.
3. Move the VMs onto the vSAN.
4. Each host that became free was upgraded and joined the vSAN.
5. Repeat until the new cluster was complete on **7.0.3**.

Installing and configuring each host took **about an hour**.

## Moving the VMs

The new cluster didn't exist yet: we created it in a **new vCenter**, with the first three hosts on vSAN. From there, each VM was moved with **Cross vCenter vMotion**, live and **with no downtime**, in the windows the customer approved.

In total, all **20 VMs** in the cluster were moved. Once the hosts were in place, the project took **one month**. That month includes measuring the possible downtime, choosing each VM's low-load moments, installing, configuring and migrating.

## Result

- A new cluster on all-flash vSAN, with every host on 7.0.3.
- The customers' networks and VLANs never changed at any point.
- The VMs were moved live, with no downtime, in windows approved by the customer.
