---
title: A status page without exposing Uptime Kuma
date: 2026-11-03
summary: "I wanted to show my homelab's status on the site without publishing the Uptime Kuma dashboard. The solution: have the site's nginx forward just two read-only URLs."
tags: [Uptime Kuma, nginx, Security, Homelab]
---

Uptime Kuma has public status pages, and the easy route would have been to publish it on a subdomain through the Cloudflare tunnel. The problem is that **the admin dashboard's login screen** would then be on the Internet too. I didn't want that.

## The idea

The site already has its own nginx. For its status pages, Kuma uses two read-only URLs that return JSON:

- `/api/status-page/<slug>`: the list of monitors and groups.
- `/api/status-page/heartbeat/<slug>`: the latest heartbeats and uptime.

So the site's nginx forwards **only those two**, and nothing else:

```nginx
location = /api/status/homelab {
    limit_except GET { deny all; }
    proxy_pass ${KUMA_URL}/api/status-page/homelab;
    proxy_connect_timeout 3s;
    proxy_read_timeout 5s;
    proxy_hide_header Set-Cookie;
    add_header Cache-Control "no-store" always;
}
```

- `location =`: exact match, so no other Kuma path can be requested.
- `limit_except GET`: any other method gets a 403.
- `proxy_hide_header Set-Cookie`: no Kuma cookie ever goes out.
- `KUMA_URL` lives in a `.env` on the server, not in the repository.

Kuma still only listens on the local network.

## The page

With that data, the site itself draws [/en/status/](/en/status/) and the console on the home page (try the `status` command). It refreshes every minute, in the browser.

In Kuma, on top of that, every monitor has the **Show Clickable Link** option turned off: that way the public API returns no internal URLs or IPs, only names and states.

## The read-only nginx detail

The site's container runs with a **read-only** file system. The official nginx image generates its configuration from templates at startup (substituting `${KUMA_URL}`), but it needs to write the result somewhere. The solution was to generate it in `/var/run`, which is already a `tmpfs`:

```dockerfile
ENV NGINX_ENVSUBST_OUTPUT_DIR=/var/run
RUN sed -i 's#include /etc/nginx/conf.d/\*.conf;#include /var/run/*.conf;#' /etc/nginx/nginx.conf
```

## And if Kuma doesn't answer

nginx returns a 502 and the site shows "status not available". The site keeps working: it's the monitoring that's failing, not the service.

The code is at [github.com/mateocouso94/mcouso-web](https://github.com/mateocouso94/mcouso-web).
