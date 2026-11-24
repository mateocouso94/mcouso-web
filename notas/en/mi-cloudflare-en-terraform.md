---
title: My Cloudflare in Terraform, without touching anything
date: 2026-11-24
summary: "I moved this site's tunnel and DNS records, which had been running for weeks and were set up by hand, into Terraform. The rule was not to change anything in Cloudflare: import, check that the plan comes out empty, and only then start managing it as code."
tags: [Terraform, Cloudflare, IaC, Backblaze B2, Homelab]
---

This site reaches the internet through a [Cloudflare tunnel](/en/notes/como-se-despliega-esta-web/). I had created the tunnel, its routes and the DNS records by hand in the dashboard, and they worked fine. The problem was that the only documentation of how they were configured was the dashboard itself.

I really noticed it when I set up the [standby replica](/en/notes/que-un-corte-de-luz-no-tumbe-la-web/): I changed the tunnel route from the dashboard and, for a while, requests served by the homelab returned errors. There was no way to review the change before making it, or to see afterwards what it had touched.

Terraform fixes that: the configuration lives in a repository, every change is reviewed with a `plan` before it's applied, and the git history says what changed and when. It was also the next step I had set myself for the homelab.

## The rule: import without changing anything

The site was in production, so the first phase had a single rule: **Terraform had to adopt what already existed without modifying anything**.

In practice, that means importing each resource into Terraform's state and requiring the plan to say exactly this:

```
Plan: 4 to import, 0 to add, 0 to change, 0 to destroy.
```

If any `change` or `destroy` showed up, the code was fixed until it went away. A plan that touched anything was never applied. There were four resources: the tunnel, its configuration (the routes) and the two DNS records, one for the domain and one for `www`.

To avoid writing the code by hand I used `cf-terraforming`, Cloudflare's official tool. It reads what's in your account and generates the Terraform code and the `import` blocks.

## Where each piece lives

| What | Where | Why |
|---|---|---|
| Code | private GitHub repository | review through PRs, and history |
| State | a Backblaze B2 bucket | out of git, with every version kept |
| Credentials | a file on the server and my password manager | never in the repository |
| Execution | the monitoring mini PC | always on, inside my home |

**State doesn't go in git.** It's the file where Terraform records what it manages, and it can contain sensitive data. I keep it in B2, where I already had the [homelab backups](/en/notes/copias-3-2-1-0/), but in a separate, private, versioned bucket: if something goes wrong, I can go back to any previous state. B2 is compatible with the S3 API, so Terraform uses it through its `s3` backend plus a few settings, because the compatibility isn't complete.

**The token, with the bare minimum.** The Cloudflare token can only edit this domain's DNS, read the zone and manage tunnels. Nothing else. My first attempt was a token with edit rights on every zone and every category: the dashboard template makes that very easy. It's the same thing I check every day in Azure and AWS, so there was no reason to skip it at home.

## The stumbles

None of this worked first time, and the failures are the most useful part to share:

- **`cf-terraforming` downloaded its own Terraform.** Because I didn't tell it where the installed one was, it pulled a 123 MB copy into the project folder, and my `git add -A` put it in the commit. GitHub rejected it for size. Since the commit hadn't been pushed yet, I redid it without the binary and added it to `.gitignore`.
- **A parameter with its own format.** For the tunnel configuration, the tool wants the ID as `type=ID`, not the bare ID.
- **An import the tool can't do.** It generates the code for the tunnel configuration, but not its `import` block. The import script writes that one by hand.

None of these failures could break the site, and that was the point of the rule: until the plan comes out clean, nothing gets applied.

## From generated code to readable code

The code `cf-terraforming` generates works, but it's hard to read: resources with names like `terraform_managed_resource_43c1…` and the tunnel ID copied in several places. In a second step I rewrote it into a single file:

```hcl
locals {
  origen    = "http://mcouso-origin:3000"
  hostnames = ["www.mcouso.es", "mcouso.es"]
}

resource "cloudflare_dns_record" "web" {
  for_each = toset(local.hostnames)

  zone_id = var.zone_id
  name    = each.value
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.web.id}.cfargotunnel.com"
  proxied = true
  ttl     = 1
}
```

- **One list of names generates both the DNS records and the tunnel routes.** To publish a new subdomain, I add one line and Terraform creates both, without me forgetting either.
- **The DNS records point to the tunnel by reference**, not with its ID copied in.
- **`moved` blocks** to go from the generated names to the new ones without recreating anything. The plan came out with no changes again.
- **The tunnel can't be deleted from Terraform** (`prevent_destroy`): both the homelab and the replica use it.

Like the rest of the homelab, I wrote the code with help from AI. The decisions, the review of every plan and the execution were mine.

## What's next

- **The zone's security settings:** strict SSL, HSTS and TLS 1.2 as a minimum. It will be the first real change made with Terraform, and this time the plan will have changes to review.
- **Bringing other parts of the homelab into code**, starting with what's currently only documented in each service's dashboard.
