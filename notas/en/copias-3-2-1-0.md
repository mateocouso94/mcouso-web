---
title: 3-2-1-0 backups on my homelab
date: 2026-11-04
summary: "Three copies, two media, one off-site and zero errors: restic backups between my two mini PCs and Backblaze B2, plus a real restore every week to check they work."
tags: [Backup, restic, Backblaze B2, Homelab, Uptime Kuma]
---

At work I've built backups and DR with Veeam for customers. At home I had nothing: if a disk in the homelab died, I'd lose the configuration of everything. So I solved it with the same rule I'd apply for a customer, scaled down to two mini PCs.

## 3-2-1-0

- **3 copies**: the original data, a copy on the other mini PC and another on Backblaze B2.
- **2 media**: the other machine's disks and the cloud.
- **1 off-site**: B2, in the Amsterdam region.
- **0 errors**: a backup that has never been restored isn't a backup. Every week it gets restored for real and checked.

The last number is the one that's almost always missing.

## The pieces

- **restic**: encrypted, incremental, deduplicated backups. A single binary, installed on the system and not in Docker. On the day I need to restore, Docker is quite likely to be exactly what's broken.
- **Chrooted SFTP** between the mini PCs: each machine has a user that can only use SFTP and only sees its own backup folder.
- **Backblaze B2** through its S3-compatible API. Restic encrypts everything before uploading it: B2 only ever holds encrypted blocks.
- **systemd**: one timer for the daily backup and another for the weekly verification.
- **Uptime Kuma**: one Push monitor per destination and another for the verification. If something fails, or simply doesn't run, I get a Telegram message.

## Databases without stopping services

Copying an SQLite file while the service is writing to it can leave an inconsistent copy. Before each backup, the script takes a hot dump:

```bash
sqlite3 /opt/uptime-kuma/data/kuma.db ".timeout 10000" ".backup '/var/backups/homelab-dumps/kuma.sqlite3'"
```

The dump is consistent and nothing has to stop. This matters most for AdGuard: if I stop it, the house loses DNS.

## The "0": restoring for real

Every Sunday, `verify.sh` does three things against each destination:

1. `restic check --read-data-subset 5%`: it doesn't just check the indexes, it also reads and validates 5 % of the actual data. In five weeks, everything has been read.
2. It restores a **canary**: a file with a random value that the backup writes every night. If what comes back doesn't match exactly what was written, something is wrong.
3. It restores the database dumps and runs `PRAGMA integrity_check`.

If any of the three fails, Kuma turns red.

## Tested before it reached the server

The scripts are tested in GitHub Actions with real restic every time I change them. The test backs up, checks retention, verifies and restores byte for byte. It also **deliberately corrupts** a repository, to check the verification catches it, and **removes** a destination, to check the other one keeps being backed up.

The test found a bug before it reached production: if I pasted the Kuma URL as it was (`...?status=up&msg=OK`), bash interpreted the `&` characters and the verification never reported in.

## What I found when installing it

The scripts were tested, but real servers always have surprises:

- **Docker data on the NVMe.** Kuma, Grafana and Prometheus kept their data in Docker volumes inside `/var/lib/docker`, on the system disk. If that disk died, the data went with it. I moved it into folders next to each `compose` file, under `/opt` on the SSD. Now, if I replace the NVMe, I reinstall, mount the SSD and run `docker compose up -d`.
- **The SFTP chroot demands root.** SSH accepted the key and dropped the connection straight away. The reason was that `ChrootDirectory` requires every folder on the path (`/`, `/opt`, `/opt/backups`) to be owned by root and writable by nobody else, and `/opt` belonged to my user.
- **Not everything ending in `.db` is SQLite.** AdGuard's `stats.db` and `sessions.db` are BoltDB, so they can't be dumped with `sqlite3`. They're copied as ordinary files.
- **Docker layers that didn't need backing up.** On the other machine, `/opt` held 11 GB of image layers and build cache. They download again on their own, so I only back up what has value: `/opt/ci` and `/etc`.
- **Kuma URLs, by IP.** Kuma gave the alert URLs with a name only my AdGuard resolves. If AdGuard goes down, the alert wouldn't arrive just when it's needed most.

## What it costs

| Machine | Data backed up | Used on each destination | First copy to B2 |
|---|---|---|---|
| homelab-red | 361 MiB | 115 MiB | 7 s |
| homelab | 53 MiB | 10 MiB | 4 s |

Restic compresses and deduplicates: the 414 MiB of data take up about 125 MiB on B2. Each night's backup only uploads what has changed. B2 charges $6.95/TB per month and **the first 10 GB are free**, so right now this costs me **€0**.

The first verification restored from all four destinations and checked the canary and both of homelab-red's databases. All correct.

The code and the installation guide are at [github.com/mateocouso94/mcouso-web/tree/main/infra/backup](https://github.com/mateocouso94/mcouso-web/tree/main/infra/backup). You can see the live state of the backups at [/en/status/](/en/status/) and with the `backup` command in the console.
