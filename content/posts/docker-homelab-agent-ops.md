+++
title = "Twenty-plus containers and agent-operated ops"
date = "2026-08-14T09:00:00-04:00"
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

I operate a **Dockerized homelab with 20+ production containers** — agent runtimes, supporting services, runners, media, dashboards — with **agent-driven container ops** in the loop. That number is on the [About](/about/) page for a reason: it is a real ops footprint, not a laptop demo.

## Why the host layer matters

Without a host story, “multi-agent” collapses into:

- One laptop session  
- One API key  
- One human watching a terminal  

With a host story, you get:

- **Isolation** — services and agents fail in smaller blast radii  
- **Repeatability** — recreate the world from compose/config, not folklore  
- **Surfaces for control** — health, logs, restarts, and dashboards  

On the constellation, Docker sits under the fleet; Azure is where work meets cloud and pipeline reality; dashboards are the web control surface — supporting identity, not replacing it.

## Hardened defaults (the boring half)

I care less about clever container tricks than about **defaults that assume compromise and mistakes**:

- Capabilities dropped where possible  
- Networks scoped on purpose  
- Read-only roots when the workload allows  
- Secrets not casually mounted into every agent  

Agents that can operate containers are powerful. They should inherit the same paranoia you would give a new on-call engineer on day one.

## Agent-operated does not mean unattended chaos

“Agent-operated” means agents can **propose and execute routine ops work** under the same gate stack as code:

1. Plan the change  
2. Apply in isolation where possible  
3. Pass eval / policy checks  
4. Escalate when the action is irreversible or ambiguous  

If an agent restarts a healthy stack “because it felt stuck,” that is not ops excellence — that is a missing gate.

## Azure and delivery

Cloud is not a logo strip on a résumé. In this system, **Azure** (and GitHub/ADO-style pipelines) is where personal production meets **SLA-shaped delivery**: builds, deploys, and the long tail of platform work. Homelab and cloud are complementary: local density for agents and tools; cloud for reach and durable delivery surfaces.

## Series

| | |
|--|--|
| ← Previous | [Human approval: the merge button still matters](/posts/human-approval-merge-button/) |
| Overview | [How I run an agent production system](/posts/agent-production-system/) |
| Next → | *From Xbox SLAs to agent fleets* (scheduled) |

---

**Bottom line:** prompts do not host production. Containers, networks, pipelines, and dashboards do. If you cannot draw the host layer, you do not yet have an agent **production** system — you have a conversation.
