---
title: A daily homelab report with local AI (and why I chose the slow model)
date: 2026-11-25
summary: "Every morning, a mini PC wakes my desktop, feeds the homelab's data to a local AI model and sends me the summary on Telegram. I started with a fast model; after comparing it with four others on the same data, I kept the slowest one, because it was the only one that didn't get anything wrong."
tags: [Local AI, Ollama, Gemma, Homelab, Prometheus, Privacy]
---

My [homelab](/en/notes/como-esta-montado-mi-homelab/) runs Prometheus, Grafana and Uptime Kuma. All the data was there, but to find out how things were going I had to go and look. I wanted the opposite: a short summary on my phone every morning, and only having to log in when something looked off.

Summarising technical data in plain language is exactly what a language model is good at. This note covers how I set it up and, above all, how I chose the model: first for speed, which was a mistake, and then for accuracy.

## Why local

What I give the model is a full picture of my network: machine names, IPs, services, errors from the logs and backup times. I treat that information the way I'd treat a client's: I don't paste it into an external API without thinking twice. With a local model, the data goes from one mini PC to another machine in my home and back, without leaving the network.

That doesn't mean I avoid cloud AI. I rely on it heavily to write scripts, prepare deployments and automate tasks: it does in minutes what would take me hours. But there it works with code and configuration. The real day-to-day data, the data that describes my network, is analysed by the local model.

## The hardware

The AI runs on my desktop, not on the homelab: the mini PCs have no GPU.

| | |
|---|---|
| CPU | AMD Ryzen 7 7800X3D |
| RAM | 32 GB DDR5-6400 |
| GPU | AMD Radeon RX 9070 XT, 16 GB of VRAM |
| OS | Windows 11 |
| Models | on a dedicated 1 TB NVMe |
| Model server | Ollama, native on Windows, using the GPU through Vulkan |

On Windows, ROCm is still patchy with RDNA 4 cards, so Ollama uses the GPU through **Vulkan**. It works well.

## The rule: nothing depends on the desktop

The desktop is my workstation, not a server, and it's off most of the day. So the rule was the same as with the [site replica](/en/notes/que-un-corte-de-luz-no-tumbe-la-web/): **the homelab cannot depend on it**. If the desktop is off or broken, the only thing that stops working is the AI.

## How it works

```
monitoring mini PC                              desktop
  1. collects data (Prometheus, Kuma, logs)
  2. desktop off? → Wake-on-LAN  ───────────▶  boots, Ollama ready in ~70 s
  3. sends the data to the model ───────────▶  gemma4:31b (GPU + RAM)
  4. gets the summary            ◀──────────
  5. orders the shutdown         ───────────▶  shuts down with a 2-min warning
  6. strips IPs and sends it to Telegram
```

- The desktop's firewall only accepts connections to Ollama from the monitoring mini PC.
- To shut it down, the mini PC logs in over SSH with a key that **can only run two commands**: shut down in two minutes, or cancel the shutdown.
- If the desktop **was already on**, the report doesn't load the AI, because I might be using it. It still arrives, as a short summary with the numbers.
- If the main model fails, the report retries with a smaller **fallback model** and says so in the title.

## Choosing the model: speed first

I started with `gpt-oss:20b`, a MoE (*mixture of experts*) model. It has 21 billion parameters, but only about 3.6 billion are active per token. That's why it writes at over 100 tokens per second on my card, and it also fits entirely in VRAM. On paper, it was the obvious choice.

The reasoning had a flaw: **for a daily report, speed barely matters**. It's generated once a day, in the early hours. Whether the text takes 5 or 60 seconds makes no difference when just booting the desktop takes a minute. What matters is that the report tells the truth.

## The comparison

To choose with data rather than gut feeling, I wrote a small script, `comparar-modelos`. It gives several models **the same data and the same instructions** the report uses, and saves each answer with its timings. What I measured was accuracy: whether the report matches the data, whether it makes anything up, whether it follows the format, and whether it flags what really needs checking.

The test data had two real problems: site availability had dropped to 93% because of an overnight outage, and a systemd service had failed.

**Round one: MoE vs dense.**

| Model | Type | Speed | Result |
|---|---|---|---|
| `gpt-oss:20b` | MoE, 3.6B active | 113 tokens/s | Fast, but it **flagged as a problem a certificate that expired in 67 days** (the threshold is 21). It didn't mention the failed service and mixed in English. |
| `qwen3:14b` | dense | 57 tokens/s | It caught the failed service and made nothing up, but it mixed the two machines' figures without saying which number belonged to which. |

At half the speed, the dense model was more accurate. The dense model's formatting slips could be fixed with instructions; the MoE's inventions couldn't. So I tightened the instructions (name each machine, only count as a problem what meets the criteria, don't copy log lines) and extended the test to larger dense models.

**Round two: dense models, from 14B to 31B.**

Since speed didn't matter, I also tried models that don't fit entirely in 16 GB: the part that doesn't fit goes to system RAM and the model runs slower, but it works.

| Model | Load | Speed | Total time | Result |
|---|---|---|---|---|
| `qwen3:14b` | 23 s | 57 tokens/s | 33 s | Opened with "✅ all good" and then listed problems. It said the disks were below 20% (they were at 22% and 26%). |
| `magistral:24b` | 36 s | 17 tokens/s | 49 s | "✅ all good" with the site at 93%. **It made up the time of the last backup.** |
| `mistral-small3.2:24b` | 39 s | 14 tokens/s | 55 s | "✅ all good". It copied log lines in English and flagged no problems. |
| **`gemma4:31b`** | 52 s | **8 tokens/s** | **7 min** | **Correct from start to finish**: the warning at the top, each machine's disk, both problems under "Check" with their machine, and, since it didn't have the backup time, it left it out instead of inventing it. |

## Why the slow model

I went with **`gemma4:31b`**, a dense model with 31 billion parameters. It's the slowest of them all: 8 tokens per second, because part of the model sits in RAM and because it reasons a lot before answering (about 2,700 tokens for a 12-line report). Each report takes about 7 minutes.

And I don't mind, because it's **the only one that didn't get anything wrong**. In a monitoring report, a mistake has consequences. A "✅ all good" with the site down is worse than no report at all. An invented problem makes you stop trusting the real alerts. I value accuracy over speed, and here size makes the difference: the larger model reasons better about data it has never seen before.

The cost: the desktop on for about 10 minutes a day, counting boot and shutdown, and the report arriving a few minutes later. As a fallback I kept `qwen3:14b`, which is also the one I use for chat, because at 57 tokens/s the difference really shows.

Two honest caveats:
- **It's one run per model.** These models don't always answer the same way, so I'll repeat it with fresh data before calling it settled.
- Round one favoured `gpt-oss` on time: it was already loaded in memory and didn't have to be read from disk.

## Verified: Ollama doesn't reach the internet

A local model doesn't guarantee that nothing leaves. Ollama has optional cloud features (remote models and web search), and it also connects out to update itself and download models. I don't use any of them, but I didn't want to rely on that alone:

- The cloud features are **disabled** in Ollama's configuration.
- The Windows firewall **blocks all of Ollama's outbound internet traffic**. Requests from the mini PC still get through because they're inbound connections.
- To pull a model, I turn the rule off for a moment and back on again.

## What I ask the model for

The report goes out every morning and covers the last 24 hours; on Sundays, the whole week. It collects disk and RAM usage, temperatures, reboots, SMART health, site availability and certificate days, Kuma monitors, containers, backups, system errors and pending updates.

I refined the instructions using the mistakes from the comparison: plain text, one line per area with concrete numbers and each machine's name, a ⚠️ first line if there's any problem, a final "what to check" list, summarising in its own words, and **not making up anything that isn't in the data**.

## The only thing that leaves home

The summary arrives on Telegram, and Telegram isn't in my home. Before sending it, the script swaps IPs for names (`homelab`, `router`...) and masks any other IP or MAC address that slipped through. The analysis uses all the data; only the summary reaches my phone, with no addresses.

## What it found in the first week

On the first Sunday, the report said Prometheus and Kuma weren't responding, and Grafana sent three disk alerts. Looking into it, none of the problems was what it seemed:

- **Prometheus was running, but not storing data.** When I moved its data to the SSD weeks earlier, the folder ended up owned by root: it could write to existing files but not create new ones. Two days later, Grafana hit the same problem when it restarted.
- **The disk alerts weren't about the disks:** they were "no data" alerts, a knock-on effect of the above.
- **The report itself was looking for Prometheus and Kuma at the wrong address.** That bug was mine.

Now an alert fires if Prometheus stops storing data, and Prometheus checks the site over HTTPS as well as by ping.

## What I take away

- **The AI summarises, it doesn't diagnose.** The report got the cause wrong, but it made me look at a failure that had gone unnoticed for days.
- **Choosing a model means measuring, not reading benchmarks.** The one that topped the speed charts was the one that invented a problem with my data.
- **For analysis, accuracy before speed.** A report that takes 7 minutes and gets it right is worth more than one that takes 17 seconds and gets it wrong.
