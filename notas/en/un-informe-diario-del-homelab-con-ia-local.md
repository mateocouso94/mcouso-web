---
title: A daily homelab report with local AI
date: 2026-11-24
summary: "Every morning, a mini PC wakes my desktop over the network, feeds the homelab's monitoring data to gpt-oss:20b on my GPU, sends me the summary on Telegram and shuts the desktop down again. Local AI, because that data describes my whole network and I don't want it leaving home."
tags: [Local AI, Ollama, gpt-oss, Homelab, Prometheus, Privacy]
---

My [homelab](/en/notes/como-esta-montado-mi-homelab/) runs Prometheus, Grafana and Uptime Kuma. All the data was there, but to find out how things were going I had to go and look. I wanted the opposite: a short summary on my phone every morning, and only having to log in when something looked off.

Summarising technical data in plain language is exactly what a language model is good at. The question was which one, and where.

## Why local

What I give the model isn't just any text. It's a full picture of my network: machine names, IPs, which services run on each one, which errors show up in the logs, what time the backups run. I treat that information the way I'd treat a client's: I don't paste it into an external API without thinking twice.

With a local model, that concern goes away. The data goes from one mini PC to another machine in my home and back, without leaving the network. I can pass it as it is, without anonymising anything first.

And the GPU was sitting idle. My desktop is switched off most of the day. One report a day is a good use for it: zero cost and no dependency on any external service.

That doesn't mean I avoid cloud AI. I rely on it heavily to write scripts, prepare deployments and automate tasks: it does in minutes what would take me hours. But there it works with code and configuration. The real day-to-day data, the data that describes my network, is analysed by the local model.

## The hardware

The AI doesn't run on the homelab but on my desktop. The mini PCs have no GPU, and the desktop's card has plenty of memory for a mid-sized model:

| | |
|---|---|
| CPU | AMD Ryzen 7 7800X3D |
| RAM | 32 GB DDR5-6400 |
| GPU | AMD Radeon RX 9070 XT, 16 GB of VRAM |
| OS | Windows 11 |
| Model server | Ollama, native on Windows |

An AMD detail: on Windows, ROCm is still patchy with RDNA 4 cards, so Ollama uses the GPU through **Vulkan**. It works well, and the model runs 100% on the GPU.

Everything else lives in the homelab, on the monitoring mini PC: the scripts that collect the data, wake and shut down the desktop and talk to the model, plus [Open WebUI](https://openwebui.com/) as a chat interface for when I want to use the model by hand.

## Why gpt-oss:20b

I was looking for a model that ticked three boxes: it had to fit **entirely in 16 GB of VRAM**, be **fast**, and follow strict formatting instructions well. `gpt-oss:20b`, OpenAI's open-weight model, does all three:

- **It fits with room to spare.** It has 21 billion parameters, but it ships quantised to 4 bits (MXFP4) and takes about 12 GB. That leaves about 4 GB for context, which I set to 16,000 tokens because a full week of data is long.
- **It's fast because it's a MoE** (*mixture of experts*): of those 21 billion parameters, only about 3.6 billion are active per token. On my card it writes at about **106 tokens per second**. For a 15-line summary, generation takes seconds.
- **Adjustable reasoning.** You can ask it to think a little, a medium amount or a lot. For the report I use medium: it's worth the extra few seconds.
- **Apache 2.0 licence.** I can use it however I like, with no strings attached.

I tried a smaller model first. It worked, but I was after the best model I could run without losing speed on my card, and of what I tried, `gpt-oss:20b` gives the best balance of quality and tokens per second with 16 GB of VRAM.

## The rule: nothing depends on the desktop

The desktop is my workstation, not a server, and it's off most of the day. So the rule was the same as with the [site replica](/en/notes/que-un-corte-de-luz-no-tumbe-la-web/): **the homelab cannot depend on it**. If the desktop is off or broken, the only thing that stops working is the AI. The site, DNS, monitoring and backups carry on as usual.

## How it works

```
monitoring mini PC                              desktop
  1. collects data (Prometheus, Kuma, logs)
  2. desktop off? → Wake-on-LAN  ───────────▶  boots, Ollama ready in ~70 s
  3. sends the data to the model ───────────▶  gpt-oss:20b on the GPU
  4. gets the summary            ◀──────────
  5. orders the shutdown         ───────────▶  shuts down with a 2-min warning
  6. strips IPs and sends it to Telegram
```

| Step | Time |
|---|---|
| From Wake-on-LAN to Ollama responding | ~70 s |
| Loading the model into VRAM (cold) | ~34 s |
| Generating the summary | a few seconds (~106 tokens/s) |

- The desktop's firewall only accepts connections to Ollama from the monitoring mini PC. Nothing else on the network can use it.
- To shut it down, the mini PC logs in over SSH with a key that **can only run two commands**: shut down in two minutes, or cancel the shutdown. If someone got hold of that key, the worst they could do is switch my desktop off.
- If the desktop **was already on**, the report doesn't load the AI: I might be using it, and I don't want to take its VRAM. The report still arrives, but as a short summary with the numbers and no AI.
- Only one request can run at a time, so one can't shut the desktop down while another is using it.

## Verified: Ollama doesn't reach the internet

A local model doesn't guarantee that nothing leaves. Ollama, the program that serves it, has optional cloud features (remote models and web search), and it also connects out to update itself and download models. I don't use any of those features, but I didn't want to rely on that alone:

- The cloud features are **disabled** in Ollama's configuration.
- The Windows firewall **blocks all of Ollama's outbound internet traffic**. Requests from the mini PC still get through, because they're inbound connections from the home network.
- With the block in place, the model responds just the same. To update Ollama or pull a model, I turn the rule off for a moment and back on again.

## What I ask the model for

The report goes out every morning and covers the last 24 hours; on Sundays, the whole week. It collects disk and RAM usage, temperatures, reboots, SMART disk health, site availability and days left on the certificate, Kuma monitors, stopped containers, backup results, system errors and pending updates.

The instructions are short and strict: plain text, one line per area with concrete numbers, a final "what to check" list, and **don't make up anything that isn't in the data**.

## The only thing that leaves home

The summary arrives on Telegram, and Telegram isn't in my home. So, before sending it, the script swaps IPs for names (`homelab`, `router`...) and masks any other IP or MAC address that slipped through. The analysis uses all the data; only the summary reaches my phone, with no addresses.

## What it found in the first week

On Sunday I got this:

> ⚠️ Homelab: things to check. Prometheus not responding. Uptime Kuma not responding.

At the same time, Grafana had sent me three disk alerts. Looking into it, there were three separate problems, and none of them was what it seemed:

- **Prometheus was running, but not storing data.** When I moved its data to the SSD weeks earlier, the folder ended up owned by root. It could write to existing files but not create new ones, and it had been like that for days without anything flagging it as down.
- **The disk alerts weren't about the disks.** They were "no data" alerts, a knock-on effect of the above. The disks were fine.
- **The report itself was looking for Prometheus and Kuma at the wrong address.** That bug was mine.

Two days later, Grafana failed to start after a restart: the same permissions problem, in its own folder. I fixed it the same way and checked that no other service was in the same situation.

While reviewing everything, I also found that Prometheus was only running pings: it wasn't really checking the site. I added an HTTPS check for mcouso.es, which now also gives the report the days left on the certificate. And a new Grafana alert fires if Prometheus stops storing data. The disk alerts no longer fire when what's missing is the data.

The lesson was the one I expected: **the AI summarises, it doesn't diagnose.** The report got the cause wrong, but it made me look on Sunday at a failure that had gone unnoticed for days. That's what I wanted it for.

## What's left to do

- Time the full cycle with the desktop off and see how much the boot can be shortened.
- Have the report compare with the previous week, not just describe the current one.
