---
title: How this site is deployed
date: 2026-11-03
summary: A git push and, a few minutes later, the site is updated on my homelab. No open ports, and GitHub never gets into my network.
tags: [Docker, GitHub Actions, Cloudflare Tunnel, systemd, nginx]
---

This site runs on a mini PC I have at home. At first I updated it by hand: copy the files to the server, run `docker compose build` and bring it up. It worked, but changing a single comma meant logging in over SSH. Now a commit is all it takes.

## The whole path

```
git push (main)
   │
   ▼
GitHub Actions ── builds the site and the Docker image
   │
   ▼
ghcr.io/mateocouso94/mcouso-web:latest
   │
   ▼  (the server checks every 5 minutes)
homelab-apps ── systemd timer → docker compose pull + up -d
   │
   ▼
nginx :3000 ◄── cloudflared ◄── Cloudflare ◄── mcouso.es
```

## The site: static files and nginx

The site is built with Next.js, but it has no backend: no forms, no database, nothing to compute on the server. So it's built as a **static site** (`output: 'export'`), and all that reaches production is HTML, CSS and JavaScript files.

They're served by an `nginx:alpine` container with only a few things, but done properly:

- **Read-only file system** (`read_only: true`), with `tmpfs` only for nginx's cache and PID.
- `no-new-privileges`, so nothing inside the container can escalate privileges.
- **Healthcheck**: Docker checks every 30 seconds that nginx is answering.
- **Security headers** (`X-Frame-Options`, `nosniff`, `Referrer-Policy`...) and long caching for files with a hash in their name.

There's no Node.js in production. Fewer pieces, fewer things to patch.

## The build: GitHub Actions

Every push to `main` triggers a workflow that builds the Docker image and publishes it to GitHub Container Registry with two tags: `latest` and the commit hash. The second one is for rolling back: if a release goes wrong, I put the previous hash in `compose.yaml` and a minute later I'm back where I was.

Changes can also come in as Pull Requests. In that case the workflow builds but doesn't publish: it's a check that what I'm about to merge doesn't break anything.

## The deployment: pull, not push

The usual approach is for CI to connect to the server over SSH and deploy. I didn't want that: it would mean giving GitHub a way into my network.

So I do it the other way round. On the server there's a **systemd timer** that runs a script every 5 minutes:

```bash
before=$(docker image inspect -f '{{.Id}}' ghcr.io/mateocouso94/mcouso-web:latest)
docker compose pull --quiet portfolio
after=$(docker image inspect -f '{{.Id}}' ghcr.io/mateocouso94/mcouso-web:latest)

if [[ "$before" != "$after" ]]; then
  docker compose up -d --no-build portfolio
  docker image prune -f
fi
```

If the image hasn't changed, it does nothing. If it has, it recreates the container. Everything ends up in the journal:

```bash
journalctl -u mcouso-web-update
```

I chose a systemd timer over Watchtower because it doesn't need the Docker socket mounted into another container, and because it's something I already know how to read and debug.

## Publishing: Cloudflare Tunnel

The container only listens on the server's private IP. To make it reachable from the Internet there's another container running `cloudflared`, which opens an outbound connection to Cloudflare. Visitors come in through there. The router has **no open ports**.

## Maintenance

Dependabot checks the dependencies every week (Next.js, React, the nginx image, the GitHub actions) and opens a Pull Request for each update. CI builds it; if it passes, I merge it and it deploys itself. Major versions are left out: those get reviewed by hand.

## What's left to do

- Publish Uptime Kuma as a status page.
- Telegram alerts if the deployment fails or the site stops responding.

The code is at [github.com/mateocouso94/mcouso-web](https://github.com/mateocouso94/mcouso-web).
