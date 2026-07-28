+++
title = "Claim safety: evidence before metrics"
date = "2026-08-11T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "How I keep public numbers and authorship honest — on the site, in agent output, and in tools like an evidence-backed resume workspace."
categories = ["Programming", "AI"]
tags = ["claim safety", "AI agents", "resume", "TPM", "writing"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 5
[cover]
image = "/images/posts/agent-eval-gates.jpg"
alt = "Checkpoint gates for automated and human review"
caption = "If a number cannot point at evidence, it does not ship."
+++

This is **part 5** of the [Agent production system](/posts/agent-production-system/) series. Previous: [From Xbox SLAs to agent fleets](/posts/xbox-slas-to-agent-fleets/).

---

Agents are fluent. Fluency is not the same as **true**.

Claim safety is the discipline of keeping **numbers, titles, and authorship** tied to evidence — especially when a model would rather sound complete than sound correct. It shows up in eval gates, in human approval, and in public artifacts like this site and [Resume Builder](https://github.com/DaveVoyles/resume-builder).

## Why agents fail this by default

Language models optimize for *plausible completion*. Resumes, READMEs, and blog posts reward *impressive completion*. The collision is predictable:

- Round numbers that feel right  
- “Led” vs “contributed” inflation  
- Implied invention of tools you only integrated  
- Metrics without a timestamp or source  

A production agent system that can open PRs **must** treat claim safety as a gate, not a writing preference.

## Rules I actually use

These are the same rules that bound [About](/about/) and this series:

1. **Verified figures only** — e.g. 10+ years at Microsoft, ~$50M commerce program, 12h→30m publish target, 20+ containers. No vanity counters without a source.  
2. **Authorship humility** — prefer “**extended and operate**” for agent platforms; do not claim original invention of upstream open-source systems.  
3. **Past-tense where true** — former Xbox/Microsoft TPM, not a fictional current title.  
4. **No logo soup** — stack claims match confidence (Azure and Docker yes; fashion-statement K8s/Terraform no).  
5. **Public = stricter** — if it is on davevoyles.com or a résumé, the bar is higher than a private scratch note.

## Evidence-backed tooling

[Resume Builder](https://github.com/DaveVoyles/resume-builder) exists because job search is a **claim surface**. AI-assisted editing without evidence discipline just industrializes exaggeration.

The product idea is simple: **role matching and language generation stay attached to what you can defend.** Same philosophy as eval gates on code — different artifact.

## How this plugs into the fleet

| Layer | Claim-safety job |
|-------|------------------|
| Search / retrieval | Prefer sources over invention |
| Coder / writer agents | Draft only within evidence |
| Eval gates | Block or flag unsupported metrics |
| Human approval | Final call on public-facing claims |
| Dashboards / site | Publish only what survived the funnel |

On the map: start at [Eval gates](/about/?node=eval) and [Search](/about/?node=search).


**Bottom line:** impressive is easy; **defensible** is the product. If your agents can publish, your gates must be able to say “show me the source.”
