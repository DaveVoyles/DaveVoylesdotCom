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
image = "/images/posts/claim-safety-validation-workflow.jpg"
alt = "Claim safety validation workflow from agent draft through eval gate to publish or human escalation"
caption = "If a number cannot point at evidence, it does not ship."
+++

This is **part 5** of the [Agent production system](/posts/agent-production-system/) series. Previous: [From Xbox SLAs to agent fleets](/posts/xbox-slas-to-agent-fleets/). Constellation nodes: [Eval gates](/about/?node=eval), [Search](/about/?node=search), [Human approval](/about/?node=human).

---

Agents are fluent. Fluency is not the same as **true**.

Claim safety is the discipline of keeping **numbers, titles, and authorship** tied to evidence — especially when a model would rather sound complete than sound correct. It shows up in [eval gates](/posts/eval-gates-not-theater/), in [human approval](/posts/human-approval-merge-button/), and in public artifacts like this site and [Resume Builder](https://github.com/DaveVoyles/resume-builder).

If your agents can open PRs, draft blog posts, or rewrite a résumé, they can also industrialize exaggeration. The fix is not “write more carefully in the prompt.” The fix is treating unsupported claims the same way you treat a failing test: **block or escalate**, do not ship.

## Why agents fail this by default

Language models optimize for *plausible completion*. Resumes, READMEs, and blog posts reward *impressive completion*. Put those incentives in the same loop and you get a predictable failure mode: the draft sounds confident, the metric feels right, and nobody can point at a source when asked.

The collision usually looks like this:

- **Round numbers that feel right** — a revenue figure rounded up, a latency win with no baseline, a “N agents in production” counter invented for rhythm  
- **Verb inflation** — “led” where the honest word was “contributed,” “built” where the honest phrase was “extended and operates”  
- **Implied invention** — treating an upstream open-source agent stack as if you authored it because you run it hard  
- **Metrics without a timestamp or source** — numbers that cannot survive “show me the evidence”  
- **Present-tense title drift** — “Senior TPM at Xbox” as a current claim when the true line is **former**

None of that requires malice. It requires a system that optimizes for sounding done. A production agent system that can publish **must** treat claim safety as a gate, not a writing preference.

## Picture this: the same sentence, two outcomes

An agent drafts a line for a public page:

> “I built a multi-agent framework used in production across dozens of teams, cutting publish time by 90%.”

That sentence is fluent. It is also a claim bomb if you cannot defend every clause:

| Fragment | What evidence would need to exist |
|----------|-----------------------------------|
| “I built” | Original authorship of the framework, not integration work |
| “multi-agent framework” | A named system you actually own vs. one you **extend and operate** |
| “dozens of teams” | Countable org footprint you can stand behind |
| “90%” | Baseline, after state, and scope of the measurement |

In my system that draft does not get to “sounds good, ship it.” It hits a source-of-truth check. If the number is not on the allowlist, or the authorship verb overclaims, the path is **amber or red** — stop for a human, or rewrite inside evidence. Same muscle as Xbox publish windows: confidence is not a gate; checks are.

![Draft metric highlighted with a red “no evidence found” flag instead of a ship-ready number](/images/posts/claim-safety-no-evidence-found.jpg "Unsupported metric: fail closed, do not invent a confident percentage")

## Rules I actually use

These are the same rules that bound [About](/about/) and this series. They live as a single public source of truth in the site repo (`docs/claim-safe-facts.md`) so agents and humans argue with a document, not with folklore:

![Editor view of a claim-safe facts allowlist — verified figures the agent may use, nothing invented](/images/posts/claim-safety-source-of-truth-file.jpg "One allowlist: agents and humans argue with a document, not folklore")

1. **Verified figures only** — e.g. **10+** years at Microsoft, **~$50M** commerce program, **12h → 30m** publish target, **20+** containers. No vanity counters without a source.  
2. **Authorship humility** — prefer “**extended and operate**” (or “integrated and operates”) for agent platforms; do not claim original invention of upstream open-source systems.  
3. **Past-tense where true** — former Xbox/Microsoft TPM, not a fictional current employer claim.  
4. **No logo soup** — stack claims match confidence (Azure and Docker yes; fashion-statement K8s/Terraform as confidence claims no).  
5. **Public = stricter** — if it is on davevoyles.com or a résumé, the bar is higher than a private scratch note.  
6. **Stop and ask on disagreement** — if two evidence sources conflict, do not silently pick the more impressive one.

The allowlist is deliberately short. A short list is a feature: it forces soft language (“high-stakes platform work,” “cross-team delivery”) where a hard number does not exist yet.

## Evidence-backed tooling

[Resume Builder](https://github.com/DaveVoyles/resume-builder) exists because job search is a **claim surface**. AI-assisted editing without evidence discipline just industrializes exaggeration — faster bullet points, weaker truth.

The product idea is simple: **role matching and language generation stay attached to what you can defend.** Same philosophy as eval gates on code — different artifact. A tailored résumé that invents impact is not “optimized for ATS.” It is a future integrity problem wearing a productivity costume.

That tooling also makes the site series honest. The About metrics, the Xbox transfer post, and this post all pull from the same discipline: if a number is not allowed, it does not appear as a hard claim. Soft paraphrase is fine; inflation is not.

## How this plugs into the fleet

Claim safety is not a single checkbox at the end. It is a job at every layer that touches language or numbers:

| Layer | Claim-safety job |
|-------|------------------|
| Search / retrieval | Prefer sources over invention; cite when the system can |
| Coder / writer agents | Draft only within evidence; refuse to “complete” unsupported metrics |
| Eval gates | Block or flag unsupported metrics, present-tense employment drift, authorship theft |
| Human approval | Final call on public-facing claims that survive automation |
| Dashboards / site | Publish only what survived the funnel |

On the map: start at [Eval gates](/about/?node=eval) and [Search](/about/?node=search). Public claims also sit under [Human approval](/about/?node=human) for a reason — when the model is sure and the evidence is thin, a person owns the go/no-go.

![Claim safety validation workflow: agent draft and source of truth enter an eval gate, then publish or block and escalate to a human](/images/posts/claim-safety-validation-workflow.jpg "Draft meets allowlist at the gate — publish only when evidence holds")

## Theater vs real claim safety

| Theater | Real claim safety |
|--------|-------------------|
| “Don’t make things up” in the system prompt | A source-of-truth document the agent cannot waive |
| Numbers that “sound about right” | Numbers on an allowlist with context |
| “I built X” for every integrated tool | “Extended and operates” / “integrated and operates” when true |
| Always-impressive résumé drafts | Drafts that fail closed when evidence is missing |
| Fixing one bad sentence after publish | Gates that catch the pattern before merge |

![Theater versus real gates: prompt-only “don’t invent” under a spotlight on the left; allowlist, eval gate, and evidence-backed resume path on the right](/images/posts/claim-safety-theater-vs-real.jpg "A prompt is not a gate — an allowlist that can block is")

If your claim check never fails, you do not have claim safety — you have decoration. The tell is what happens when a draft wants a metric that is not on the list. A real system stops. A theatrical one rephrases until it sounds softer and ships anyway.

## What this is not

- Not a ban on storytelling — anecdotes without invented metrics are fine  
- Not a claim that personal ops equal Xbox global traffic  
- Not permission to invent “N agents in production” or dollar figures outside the allowlist  
- Not original authorship of every open-source stack I run hard

Claim safety is boring on purpose. Boring is how public trust survives contact with a fluent model.


**Bottom line:** impressive is easy; **defensible** is the product. If your agents can publish, your gates must be able to say “show me the source.”
