---
title: How my homelab is put together
date: 2026-11-04
summary: "Two mini PCs running Debian, the system on the NVMe and the data on the SSD, every service in its own folder with Docker Compose and in git, monitoring with Prometheus and Uptime Kuma, and 3-2-1-0 backups to Backblaze B2. What's there, how it's organised and why."
tags: [Homelab, Debian, Docker, Backup, Backblaze B2, Architecture]
---

The homelab is two mini PCs on a shelf at home. I use it to try out what I can't break at work, and also to serve this site. This note explains how it's put together and, above all, why it's put together this way.

## At a glance

| | homelab-red | homelab |
|---|---|---|
| Hardware | Lenovo ThinkCentre M715q Tiny | HP ProDesk 400 G6 Mini |
| System | Debian 13 | Debian 13 |
| Role | Network and monitoring | Published applications |
| Services | AdGuard Home (DNS and DHCP), Prometheus, Grafana, Blackbox Exporter, Uptime Kuma | This site (nginx), cloudflared |
| On both | Node Exporter, smartctl_exporter, Docker Compose, restic backups, automatic security patches | |

The split has a reason: if I break something playing with containers on one machine, the house's DNS and DHCP keep working on the other. And the machine that watches isn't the one that serves the site, so if one goes down, the other tells me.

## The network

- **Movistar HGU** as the Internet gateway.
- A 5-port **Gigabyte switch** for the wired network.
- **Xiaomi AX3600 running OpenWrt** for Wi-Fi and a **LAN-to-LAN VPN** to a remote network.
- **DHCP centralised in AdGuard Home**, not on the router. AdGuard has its own IP on the network thanks to a *macvlan* interface, so it sees each device's real IP and filters DNS for the whole house. One macvlan detail: the host itself can't talk to that container, so homelab-red has a small *shim* interface created by a systemd service at boot ([`infra/homelab-red/macvlan-shim.service`](https://github.com/mateocouso94/mcouso-web/blob/main/infra/homelab-red/macvlan-shim.service)). I found out when I rebooted: without it, Uptime Kuma lost DNS and flagged half the house as down.
- **A backup DNS handed out by DHCP.** AdGuard announces two servers: itself and `1.1.1.1`. If homelab-red goes off, the house still has Internet. The price is that some queries skip the filtering, because clients don't only use the second DNS when the first one fails. For a home it's worth it: a second AdGuard on the other machine would break the separation of roles for a case that almost never happens.

No service has ports open on the router. The site reaches the Internet through **Cloudflare Tunnel**: a `cloudflared` container opens the connection outwards.

## Two disks, two roles

Each mini PC has two disks, and each one has a different role:

```
NVMe  →  /       Debian, packages, Docker Engine          (can be reinstalled)
SSD   →  /opt    /opt/ci/<service>/  compose + config + data   (what matters)
```

The rule is that **there's nothing on the NVMe I can't reinstall**. Everything of value lives on the SSD, under `/opt`: each service's `compose` files, configuration and data.

So if the NVMe fails:

1. I replace the disk and install Debian and Docker.
2. I mount the SSD on `/opt`.
3. I run `docker compose up -d` in each folder of `/opt/ci`.

Everything comes back with its data, without restoring anything. If it's the SSD that fails, that's what the backups are for (further down).

It wasn't always like this. While preparing the backups I saw that Uptime Kuma, Grafana and Prometheus kept their data in Docker volumes inside `/var/lib/docker`, on the NVMe. I moved it into folders next to their `compose` files, on the SSD. It meant a couple of minutes of downtime per service, and the old volumes were left untouched for a few days in case I had to roll back.

## How Docker is organised

Each service has its own folder in `/opt/ci`, with its `docker-compose.yml` and its data next to it:

```
/opt/ci/
├── adguard/        conf/  work/
├── monitoring/     docker-compose.yml  prometheus/  blackbox/  data/
├── uptime-kuma/    docker-compose.yml  data/
├── smartctl-exporter/  docker-compose.yml
├── cloudflared/    docker-compose.yml  .env
└── portfolio/      compose.yaml  .env   (this site)
```

The rules are few and the same for every service:

- **Bind mounts, not named volumes.** The data is visible with an `ls`, gets backed up with the normal backups and moves to another machine by copying the folder.
- **Pinned versions** in the images (`prom/prometheus:v3.8.0`, `grafana/grafana:12.3.0`…), never `latest`. I upgrade when I decide to, not when the image changes.
- **Ports bound to the local network IP** (`192.168.0.20:3000:3000`), not to every interface.
- **Secrets in `.env`**, never inside the `compose` file.
- **Images aren't backed up.** They're reproducible: they get downloaded again.

On the web machine, the Docker directory is also on the SSD (`/opt/docker-data`). On homelab-red it's still on the NVMe, because all that's left there is images, which download again.

### `/opt/ci` is in git too

Each machine has its `/opt/ci` in a private GitHub repository. Nothing had to move: a `git init` in place and a `.gitignore` that leaves out the data (`data/`, `work/`), the `.env` files and the site, which has its own repository.

- **Every night at 03:00**, a systemd timer commits whatever has changed and pushes it. It checks the diff first: if it sees anything that looks like a secret, it pushes nothing and the service is left in a failed state.
- **Renovate** reads the `compose` files and, on Saturdays, opens a PR for every image with a new version, with its release notes. Major versions are only offered in a dashboard and I approve them. That way versions stay pinned, but I find out when they need bumping.
- To apply an update: `git pull` and `docker compose up -d` in the service's folder.

While preparing the first commit I found the Cloudflare Tunnel token written straight into the `compose` file. It's now in a `.env`, as the rule above says.

### The system patches itself

Both Debian machines install **security patches** on their own with `unattended-upgrades`. Only Debian's: I upgrade Docker Engine myself, one machine after the other. They don't reboot on their own either; if a kernel patch needs it, I reboot when it suits me.

## This site

The site is Next.js exported as **static files** and served by **nginx** in a read-only container. There's no Node.js in production.

- Every `git push` to GitHub builds the image, tests it and publishes it.
- The machine **pulls** the new image every 5 minutes with a systemd timer. GitHub doesn't get into my network: it's the machine that asks.

I go into detail in [How this site is deployed](/en/notes/como-se-despliega-esta-web/).

## Monitoring

- **Prometheus** collects metrics: from both machines with Node Exporter, and from external checks with Blackbox Exporter. It keeps 30 days.
- **Grafana** draws them.
- **Uptime Kuma** checks that each service responds. If something goes down, it tells me on **Telegram**. It also receives check-ins from the automated jobs: the site deployment, every backup and every verification.
- **The disks** are watched by `smartctl_exporter` on each machine. Grafana alerts me on Telegram if a disk fails its SMART self-test, if the NVMe goes past 80 % of its rated life or if read errors appear.
- **An outside watcher.** Kuma lives inside the house: if the power or the Internet goes, it goes down with everything else and can't warn me. That's why UptimeRobot checks mcouso.es every 5 minutes from outside and emails me.

Kuma's status can be seen live at [/en/status/](/en/status/). The Kuma dashboard isn't exposed: the site only reads its status API, and I explain how in [A status page without exposing Uptime Kuma](/en/notes/una-pagina-de-estado-sin-exponer-uptime-kuma/).

## Backups: 3-2-1-0

- **3 copies**: the original data, a copy on the other mini PC and another on Backblaze B2.
- **2 media**: the other machine's disks and the cloud.
- **1 off-site**: B2, in the Amsterdam region.
- **0 errors**: every week each destination is restored for real and checked.

The "manager" is deliberately simple: **restic** installed on the system (not in Docker), two bash scripts and two systemd timers.

- **Every night**, `backup.sh` takes hot dumps of the SQLite databases, writes a canary file and backs up `/opt/ci` and `/etc` to both destinations, keeping 7 daily, 4 weekly and 1 monthly.
- **Every Sunday**, `verify.sh` reads and validates part of the data, restores the canary and checks the databases' integrity.
- Every step checks in with Kuma. If something fails or simply doesn't run, I get a Telegram message.

Why restic on the system and not in a container? Because on the day I need to restore, Docker is quite likely to be exactly what's broken.

All the detail, including what I ran into while installing it, is in [3-2-1-0 backups on my homelab](/en/notes/copias-3-2-1-0/).

## Why Backblaze B2 and not a NAS

I considered buying a NAS for the backups. In the end I went with Backblaze B2, for three reasons.

**Price.** The backups of both mini PCs take up about 125 MiB after compression and deduplication. B2 charges $6.95 per TB per month and the first 10 GB are free, so today it costs me **€0**. Even at 100 GB, it would be less than a dollar a month. A two-bay NAS with its disks is several hundred euros up front, and in a few years the disks need replacing.

**Power consumption.** A NAS is on 24 hours a day. At an average draw of about 20 W, that's about 175 kWh a year. At this autumn's electricity price (about €0.19/kWh before tax, on Spain's regulated PVPC tariff), that's **more than €30 a year** in electricity alone. It's more than B2 would cost me for decades with what I store now.

**Fewer things that can fail.** A NAS means disks that break, a RAID to watch, system updates and one more machine to maintain. And it sits in my house: a fire, a burglary or a power surge would take it along with the mini PCs. B2 is, by definition, the off-site copy, and Backblaze takes care of the hardware.

The cross-backup between the two mini PCs already gives me a local copy that's quick to restore. With B2 I complete the 3-2-1 without buying anything. I'm not ruling out a NAS later on, but to store more things, not for the homelab backups.

## If the power goes

Both machines are set in the BIOS to power on by themselves when the power comes back. Docker waits for `/opt` to be mounted before starting, so services never come up on empty folders, and every container has `restart: unless-stopped`. I tested it by rebooting both: within a couple of minutes everything was green again, without touching anything.

## Next

- Applying Renovate's PRs automatically, as the site already does with its image.
- More service monitors in Kuma: DNS against AdGuard, Grafana, Prometheus and the VPN.
