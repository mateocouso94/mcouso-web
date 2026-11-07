---
title: A pre-production environment that refreshes itself
date: 2026-11-04
summary: "Every week, the pre-production environment of a SaaS on Azure is filled with production data: anonymised PostgreSQL and blob storage synced with AzCopy, from a bastion that can only read in production. And around it, day-to-day work on Azure, AWS and Linux."
tags: [Azure, AWS, Linux, PostgreSQL, Bash, Security]
---

For nine months I've been on the systems team for a customer with a **SaaS on Azure**. I also work with **AWS**. My job is operations: supporting the development team, attending meetings with the customer and maintaining the production, pre-production, development and UAT environments.

The case that sums it up best: a pre-production environment that has production data every week, without anyone having to copy it by hand.

## Why

A pre-production environment is more useful the more it looks like production. But copying production as it is won't do, because some data must never leave it: that's why it gets anonymised.

In this SaaS there are two things to copy, adding up to about **100 GB** between them:

- The database, in **Azure Database for PostgreSQL**.
- The files, in **blob storage**.

## How it works

Everything runs from a **bastion host** with connectivity to both environments. From there, every week:

1. **A bash orchestrator** copies the production database to pre-production and **anonymises** it.
2. When it finishes, **a timer kicks off the blob storage sync** with **AzCopy**. The blob script validates the copy when it's done.

```
bastion
 ├─ reads ───► PRO  DB + blobs
 └─ writes ──► PRE  1. anonymised DB
                    2. blobs, AzCopy
```

The steps are chained: **if the database copy fails or doesn't finish correctly, the blob storage isn't replicated**. That way pre-production is never left with a half-copied database and files that don't belong to it.

## Never writing to production

In a process that copies from PRO to PRE, the delicate part is the direction. That's why the bastion **only has read permission in production**: it can write to pre-production, but on the production database it can do nothing but read. Even if the process were run the wrong way round, it wouldn't execute.

## Least privilege, for people too

It's the same idea we apply to users. When someone needs access to something and Azure's built-in role would give them **more than they need**, we create a **role with only the permissions required**.

We also review user permissions and **Key Vault**, and create the keys that are needed.

## The rest of the work on Azure

- **Application Gateway with WAF**, with custom rules.
- **Azure Functions**.
- Database **backups and restores**.
- **Environments built from scratch**, including **development and UAT** ones with access for the customer, with their **Let's Encrypt** certificate and the packages the application needs.

## AWS

- **Security groups** with access restricted by port and source IP.
- **SSH only from our IP**.
- Creating machines and managing **snapshots**.
- **An AMI when retiring a production machine**, to keep its data even after the instance is gone.

## Linux day to day

Debian 10, 11, 12 and 13 and Ubuntu Server 22.04 and 24.04:

- Package updates.
- Disk expansion.
- Deploying Docker containers.
- Process management.
- Bash scripts, such as automatically deleting old backups.
- Deployments and support for the development team.
