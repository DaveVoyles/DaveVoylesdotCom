+++
title = "Human approval: the merge button still matters"
date = "2026-07-31T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "Autonomy is earned per action class. Where I keep a human on the critical path — and why that is a feature of agent production systems, not a failure of them."
categories = ["Programming", "AI"]
tags = ["AI agents", "governance", "TPM", "risk"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 2
[cover]
image = "/images/posts/agent-eval-gates.jpg"
alt = "Human-in-the-loop control at an approval console amid automated checkpoints"
caption = "Autonomy is earned. The merge button is still a product decision."
+++

This is **part 2** of the [Agent production system](/posts/agent-production-system/) series. Previous: [Eval gates are not optional theater](/posts/eval-gates-not-theater/). Constellation node: [Human approval](/about/?node=human).

---

People hear “agent fleet” and picture a fully lights-out factory. That is not what I run — and not what I want.

I run a system where **agents move the bulk of the work** and a **human still owns irreversible decisions**. The merge button (and its cousins: force-push, secrets, prod infra, public claims) is not a relic. It is a designed control.

## Autonomy is not a global boolean

Bad framing:

> Agents are autonomous: true/false.

Better framing:

> For **this class of action**, under **these checks**, may an agent proceed without me?

That is how real programs manage risk. You do not give every engineer prod root on day one. You do not give every agent an unbounded tool belt and a smile.

In practice that means most of my repos run an app-identity that can autonomously approve and merge a pull request once it clears its own review — agents genuinely ship code without me clicking a button. But that same identity is explicitly carved out of a short list of actions regardless of how clean the diff looks: force-pushes, secret rotation, anything data-destructive, production infrastructure changes, external sends. Those pause for me every time, no exceptions coded around.

## What stays on the human path

I will not enumerate a classified list of every gate here — the point is the **shape**:

- **Irreversible or hard-to-revert** actions  
- **Secret and credential** surfaces  
- **Ambiguous validation** — when green would be a guess  
- **Public claims** that could misrepresent work, numbers, or authorship  
- **Cross-repo or multi-team blast radius** that outruns a single PR review

Concretely: before a change ever reaches a pull request, it goes through a self-review pass — a set of independent read-only checks (security, deployment risk, code quality) that have to come back clean, because there's no second engineer sitting next to an agent to catch what it missed. Credential handling follows its own ladder — check identity, re-authenticate, mint a fresh token, verify the access actually covers what's needed — all before ever asking me for anything; I only get pulled in when a credential is missing outright, like setting up a brand-new machine. And public claims — numbers, authorship, anything that could misrepresent the work — get checked against a single written source of truth rather than generated fresh each time, specifically so an agent can't quietly inflate a metric because it sounded better in the moment.

Everything else can still be aggressively automated. Speed lives in the middle of the funnel. Judgment lives at the edges.

## Where this earned its stripes

This isn't theoretical design. I once had a test harness for validating a security fix — the fix itself was sound, but the harness wrapped the test payload in an extra layer of shell evaluation that didn't match how the real code actually ran it. That mismatch let a string that was supposed to stay completely inert get interpreted as a live command instead, and it deleted a chunk of local, unbacked-up work before anyone noticed.

Nothing production-facing was touched, and it was caught the same day through a blameless postmortem rather than buried — but it's exactly the kind of failure a "the code looked safe" review misses, because the code *was* safe; the test harness around it wasn't. The fix wasn't "be more careful" — it was structural: any test involving a potentially destructive payload now has to run inside a disposable, throwaway environment by rule, never against a real working directory, no matter how confident anyone is that the string can't actually execute. That's the difference between a policy and a control: a policy is advice; a control doesn't care how sure you were.

## TPM craft, not Luddism

I spent **10+ years** at Microsoft across Xbox, CSE, DX/DPE, and Reactor. Platform work taught a boring truth: **executives do not reward “we moved fast” when the outage was preventable.**

Human approval in an agent system is the same craft as:

- Critical-path ownership  
- Risk registers that actually change behavior  
- Escalation paths that are practiced, not theoretical  

On the [constellation](/about/?node=human), human approval sits **below** eval gates for a reason: automation clears what it can; people clear what it should not.

## How agents should treat the human

Good agent behavior:

- Surfacing **why** a gate fired  
- Packaging a **decision brief**, not a guilt trip  
- Never “approving itself” by rephrasing the same session as a second reviewer  

Bad agent behavior:

- Burying risk in confidence language  
- Retrying until a check flaps green  
- Treating human delay as a bug instead of a control  

The tell, either way, is what happens when a check fails or a gate fires. A well-built agent stops, states plainly what it found and why it stopped, and hands over a decision instead of a demand. A poorly-built one starts negotiating with the gate — rephrasing the same result until something looks green, or treating "wait for a human" as a bug to route around instead of the point.

**Bottom line:** if your architecture has no place for a human to say no, you did not build a production system. You built a demo with CI cosplay.
