---
title: Keeping the site up through a power cut
date: 2026-11-15
summary: "One night the power went out at home and the site was down for hours. Now, if the homelab loses power or internet, a Raspberry Pi in another home takes over on its own within minutes. No VPN between the two homes and no paid load balancer."
tags: [Cloudflare Tunnel, High availability, Raspberry Pi, Homelab, systemd]
---

This site is served from a mini PC in my [homelab](/en/notes/como-esta-montado-mi-homelab/). One night there was a long power cut and mcouso.es stopped responding for several hours. It isn't a critical site and a few minutes of downtime don't bother me, but hours do.

The answer wasn't to make my home more resilient, but to have the site **somewhere else** as well.

## The idea: a replica in another home

I have a Raspberry Pi 3 in another home, with its own power and its own internet connection. Until now it did almost nothing, so it's perfect for this: if the power goes out at my place, there's no reason for it to go out there too.

I set two conditions:

- **No linking the two homes.** No VPN between networks and no open ports. The Pi knows nothing about my network, and my network knows nothing about the Pi.
- **No paying for a load balancer** for a personal site.

## How Cloudflare Tunnel handles it

The site is already published through a [Cloudflare tunnel](/en/notes/como-se-despliega-esta-web/). A single tunnel can have **several `cloudflared` replicas** on different machines, and Cloudflare spreads visits across whichever ones are connected. If one disappears, the rest keep serving.

But if both replicas are active at once, Cloudflare sends visits to either of them, even when my home is fine. I didn't want that: normally the site should come from my homelab, and the Pi should only step in when needed.

## Standby, not load sharing

On the Pi the site is always running, with the same Docker image as at home (published for amd64 and arm64), but its `cloudflared` is **off**. Every minute, a script asks the Cloudflare API which connectors the tunnel has alive:

```
Is the homelab's cloudflared connected?
   ├─ no, for 3 minutes in a row   → the Pi starts its cloudflared
   └─ yes, for 5 minutes in a row  → the Pi stops it and hands back
```

- It's **Cloudflare** that "watches" my home, not the Pi. That's why no connection between the two homes is needed.
- The minutes of margin avoid flapping over a cut of a few seconds.
- If the API doesn't respond (for example, because the Pi's internet is down), the script changes nothing.
- The API token is **read-only**: it can look at the tunnel, not change it.
- The Pi updates the same way as the homelab: a systemd timer that pulls the new image every 5 minutes.

## If the site comes from the Pi, the homelab is down

The Pi only starts its `cloudflared` when the homelab has been disconnected for a few minutes. So if the site is being served from the Pi, **the homelab is down**: there's no other way to get there.

That affects the [status page](/en/status/) and the console's `status` command. The status comes from [Uptime Kuma](/en/notes/una-pagina-de-estado-sin-exponer-uptime-kuma/), which lives in the homelab. If there's no power at my place, there's no monitoring to show, whichever machine serves the site. And the Pi can't reach Kuma either, because there's no link between the two networks, and that's how I want it.

Instead of a bare "status not available", the site explains it. Each nginx knows which one it is (`/api/origin` returns `homelab` or `replica`), and when the replica is the one answering, the status page and the console say:

> The homelab is not responding right now (a power or internet outage at home). This site is being served by a standby replica in another home. Monitoring lives in the homelab, so it will be back when the homelab is.

During an outage, the site stays up and also tells you what's going on.

## The test

I set it up during another power cut, with the homelab off. As soon as I enabled the timers, the Pi saw that the home connector had been gone for several minutes, started its `cloudflared`, and mcouso.es was back up, now from another home.

## What's left

- **Monitoring the replica itself**: Telegram alerts when the Pi takes over or hands back, and an external monitor that can tell which machine is serving the site.
- **A drill with everything on**: stop the home `cloudflared` on purpose and time the takeover and the handback.
- A known limitation: the script detects that the homelab connector is gone (power, internet, mini PC off), but not nginx failing while the connector stays up. Uptime Kuma and the external monitor still catch that.

The code is in [`infra/replica-pi`](https://github.com/mateocouso94/mcouso-web/tree/main/infra/replica-pi).
