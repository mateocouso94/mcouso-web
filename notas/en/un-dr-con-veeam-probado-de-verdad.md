---
title: A DR with Veeam 13, actually tested
date: 2026-11-04
summary: "Veeam CDP between a customer's infrastructure and ours: a 15-minute RPO for critical VMs, a 3-hour RTO, a full day of testing and a runbook so the customer doesn't depend on us."
tags: [Veeam, DR, CDP, DNS, VMware]
---

A disaster recovery plan that has never been tested is just a document. In this project the goal was to build a DR between a customer's **on-premise infrastructure** and ours, and **prove that it worked**.

## The scope

- **Veeam 13 with CDP** (Continuous Data Protection), for this customer only.
- **10 virtual machines**, from a few GB up to **2-3 TB**.
- Target: our infrastructure, on a dedicated recovery VLAN.

| | Critical VMs | Less critical VMs |
|---|---|---|
| **RPO** (how much data can be lost) | 15 minutes | 1 hour |
| **RTO** (how long it takes to be back up) | 3 hours | 3 hours |

## First things first: everything ran on IPs

When I reviewed the customer's infrastructure I found that **everything worked by IP address**, with no DNS. That's no good for Veeam and its certificates, so before replicating anything I had to deploy DNS:

- I created the **DNS zones** with their records.
- I changed the configurations to move from IPs to **names**.

It didn't cause any problems, but it was groundwork that wasn't in the original plan.

## The deployment

I deployed the **Veeam 13** components and **proxies** and the **certificates**, and configured the backups, the target and the recovery VLAN.

## Permissions: the customer only sees their own

The customer needed access to their VMs in our vCenter, but to nothing else. I solved it with a **custom role** where everything is hidden except the state of their VMs. With that role they can only:

- See and list their VMs.
- Power them on, off and restart them.
- Open the remote console.

They don't see hosts, networks or datastores, and can't change anything else.

## The test

Testing took **a full day**:

1. The backups were brought up on our infrastructure in **about an hour**.
2. Together with the network team, we changed what was needed on the **Fortinets** so traffic would reach the recovered environment. From then on, the VMs were reachable straight away.
3. We validated **user access**, **file reads** and the rest of the checks.

It all went well.

## A runbook so they don't depend on us

The last deliverable was a **written procedure** so the customer could carry out the recovery without depending on us.

I also wrote about it on [LinkedIn](https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf).
