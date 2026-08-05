+++
title = "Twenty-plus containers and agent-operated ops"
date = "2026-08-04T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "A Dockerized homelab is not a toy rack — it is the host layer for an agent production system: runtimes, runners, dashboards, and hardened defaults."
categories = ["Programming", "AI"]
tags = ["Docker", "homelab", "AI agents", "ops", "Azure"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 3
[cover]
image = "/images/posts/agent-system-ops-floor.jpg"
alt = "Multi-agent production system illustration with host and cloud elements"
caption = "Hosts are part of the product: agents without a place to run are just prompts."
+++

This is **part 3** of the [Agent production system](/posts/agent-production-system/) series. Previous: [Human approval](/posts/human-approval-merge-button/). Constellation nodes: [Docker host](/about/?node=docker), [Azure / ADO](/about/?node=azure), [Dashboards](/about/?node=dashboard).

---

Agents need somewhere to live. Chat UIs hide that fact. Production does not.

I operate a **Dockerized homelab with 20+ production containers** split across two physical hosts — a **Mac Mini M4** running the compute-heavy services under OrbStack, and a **Synology NAS** handling bulk storage, VPN-gated download automation, and the public-facing reverse proxy. That number is on the [About](/about/) page for a reason: it is a real ops footprint, not a laptop demo.

It also didn't start life as an AI project. It started as the place I run Plex for movie and TV night and keep a genuinely well-organized backup of every PC game I've bought over the last two decades. The agent-operated layer got bolted onto infrastructure that already had to work for normal-person reasons — that's a different design constraint than building a homelab from scratch to impress an AI audience, and I think it's a healthier one.

## Why the host layer matters

Without a host story, “multi-agent” collapses into:

- One laptop session  
- One API key  
- One human watching a terminal  

With a host story, you get:

- **Isolation** — services and agents fail in smaller blast radii  
- **Repeatability** — recreate the world from compose/config, not folklore  
- **Surfaces for control** — health, logs, restarts, and dashboards  

None of that is abstract to me. Isolation means a container that starts misbehaving doesn't take down Plex while someone's mid-episode. Repeatability means when I moved my download automation off the Mac Mini and onto the NAS behind a VPN tunnel, the move was "point a new host at the same compose file and secrets" instead of re-learning three months of manual settings by hand. Surfaces for control means I have a dashboard sitting behind a reverse proxy, so "is anything actually broken right now" is a glance instead of SSH-ing into two machines to check.

![Plex media library on the Mac mini — TV shows grid under the Library view](/images/posts/Plex.jpg "Plex running as a real household service on the same host layer as the agents")

On the constellation, Docker sits under the fleet; Azure is where work meets cloud and pipeline reality; dashboards are the web control surface — supporting identity, not replacing it.

## What's actually running (this isn't hypothetical)

Twenty-plus containers is an abstract number until you know what's behind it. A few of the pieces that get daily use, for context:

- **Plex**, for movies and TV — the thing that makes the rest of this defensible to the rest of the household, not just to me.
- **A backup archive of my old PC games**, organized into folders by platform and year, served through a clean web interface I can hit from any device on the network. If I want to replay something I bought in 2009 and lost the install media for a long time ago, I find it and pull it down in a couple of clicks instead of digging through old external drives.
- **A media-automation stack** (Sonarr, Radarr, Prowlarr) that keeps the Plex library organized without me babysitting it, paired with **Recyclarr** syncing community-maintained quality profiles so I'm not hand-tuning dropdown settings across three different apps.
- **A reverse proxy in front of a dashboard**, so the whole stack has one door in and one place to see health at a glance instead of a pile of bookmarked `:port` URLs.
- **Watchtower**, which auto-updates container images on a fixed nightly schedule — but only for services I've explicitly opted in with a label, so nothing I want pinned drifts out from under me overnight.

![Docker Desktop Activity Monitor listing production containers — media stack, GitHub runner, OpenClaw, and monitoring services](/images/posts/docker-containers.jpg "Twenty-plus containers on the Mac Mini host: media automation, runners, agents, and health dashboards")

The point isn't the list — it's that this stack earns its keep on ordinary nights before it ever does anything agent-related. That's what makes the "hardened defaults" section below more than theory.

## Hardened defaults (the boring half)

I care less about clever container tricks than about **defaults that assume compromise and mistakes**:

- Capabilities dropped where possible  
- Networks scoped on purpose  
- Read-only roots when the workload allows  
- Secrets not casually mounted into every agent  

None of those are theoretical either. The download clients — the pieces of this stack most exposed to untrusted network traffic — run behind a VPN gateway container rather than talking to the internet directly off the host; if that tunnel drops, the download traffic drops with it instead of leaking out the front door. Docker networks are segmented on purpose instead of one flat bridge everything can see everything else on. Secrets live in per-service files, not one shared blob every container can read.

Agents that can operate containers are powerful. They should inherit the same paranoia you would give a new on-call engineer on day one — least privilege by default, not "we'll lock it down after something goes wrong."

## Agent-operated does not mean unattended chaos

“Agent-operated” means agents can **propose and execute routine ops work** under the same gate stack as code, not that they get root and good intentions:

1. **Plan the change** — a concrete, diffable description of what's about to happen, not a vague summary of intent  
2. **Apply in isolation where possible** — a dry run or a scoped/staged pass before anything touches a live service  
3. **Pass eval / policy checks** — automated checks that gate the change the same way a test suite gates a pull request  
4. **Escalate when the action is irreversible or ambiguous** — anything that can't be undone with a config restore or a simple restart stops and waits for a human, full stop

If an agent restarts a healthy stack "because it felt stuck," that is not ops excellence — that is a missing gate. The bar isn't "did the agent do something useful," it's "would I have approved this if I'd seen it before it ran."

## Azure and delivery

Cloud is not a logo strip on a résumé. In this system, **Azure** (and GitHub/ADO-style pipelines) is where personal production meets **SLA-shaped delivery**: builds, deploys, and the long tail of platform work. Homelab and cloud are complementary: local density for agents and tools; cloud for reach and durable delivery surfaces.


**Bottom line:** prompts do not host production. Containers, networks, pipelines, and dashboards do. If you cannot draw the host layer, you do not yet have an agent **production** system — you have a conversation.
