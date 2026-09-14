+++
title = "Human approval: the merge button still matters"
date = "2026-07-31T09:00:00-04:00"
draft = true
author = "Dave Voyles"
description = "Autonomy is earned per action class. Where I keep a human on the critical path — and why that is a feature of agent production systems, not a failure of them."
categories = ["Programming", "AI"]
tags = ["AI agents", "governance", "TPM", "risk"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 2
[cover]
image = "/images/posts/approve-and-merge-to-prod.jpg"
alt = "An engineer reviewing a deployment authorization screen showing Approve & Merge to Production and Reject Deployment options, awaiting human review"
caption = "Awaiting human review: code review passed, security scan cleared — the merge button is still a human decision."
+++

This is **part 2** of the [Agent production system](/posts/agent-production-system/) series. Previous: [Eval gates are not optional theater](/posts/eval-gates-not-theater/). Constellation node: [Human approval](/about/?node=human).

## Words I use below

- **Agent** — a program that writes code or words for you, and can use tools, in a chat or a job queue
- **Pull request (PR)** — a proposed change to a code repository; someone (or something) asks to land a diff, and reviewers say yes or no
- **Merge** — accepting that pull request into the main line of code, so the change becomes part of what ships
- **Force-push** — overwriting history on a branch; useful in cleanup, dangerous when it erases work other people (or agents) already built on
- **Irreversible action** — something hard or expensive to undo (delete data, rotate a secret into the void, change production infrastructure, send a public message you cannot unsend)
- **Approval identity** — a separate login or app credential whose only job is to approve and merge a reviewed pull request (not the same credential the agent uses to write code day to day)
- **Decision brief** — a short package an agent hands a human: what it wants to do, why the gate fired, what it already checked, and what it needs you to decide — not a guilt trip and not a demand
- **Action class** — a bucket of similar actions that share one autonomy rule; routine merges after checks can be auto, irreversible carve-outs always pause

Those eight words are the toolkit. Now the point.

---

People hear "agent fleet" and picture a fully lights-out factory. That is not what I run — and, frankly, not what I want, because factories that never stop for a human also never stop for a bad idea dressed as a clean diff.

I run a system where **agents move the bulk of the work** and a **human still owns irreversible decisions**. The merge button (and its cousins: force-push, secrets, production infrastructure, public claims) is not a relic from a slower decade. It is a designed control, the kind you notice mostly when it is missing and the outage is already on the calendar.

## Autonomy is not a global boolean

Bad framing:

> Agents are autonomous: true/false.

Better framing:

> For **this class of action**, under **these checks**, may an agent proceed without me?

That is how real programs manage risk. You do not give every engineer production root on day one. You do not give every agent an unbounded tool belt and a smile, then act surprised when the smile ships something irreversible.

In practice that means most of my repositories run an **approval identity** — a narrow app login that can autonomously approve and merge a pull request once it clears its own review — so agents genuinely ship code without me clicking a button. But that same identity is explicitly carved out of a short list of actions regardless of how clean the diff looks: force-pushes, secret rotation, anything data-destructive, production infrastructure changes, external sends. Those pause for me every time, with no clever exception coded around the pause, because exceptions are how carve-outs become folklore.

## What's actually running (this isn't hypothetical)

"Human approval" sounds like a philosophy until you see what actually enforces it day to day. A few of the mechanics doing real work in my system, for context — none of them exotic, all of them boring in the useful way:

![False path: agent self-approves or treats human delay as a bug; fix path: decision brief plus irreversible carve-outs that always pause](/images/posts/human-approval-self-approve-vs-brief.png "Self-approve is the false path. Decision brief plus carve-outs is the fix.")

*ELI10: left path negotiates with the gate; right path stops, packages a decision, and waits for a person on irreversible work.*

- **A self-review pass before any pull request exists** — independent read-only checks (security, deployment risk, code quality, test coverage) have to come back clean first. The security and deployment-risk checks are non-negotiable; there is no "skip this one, I'm confident" override, because there is no second engineer standing next to an agent to catch what it missed.
- **A separate, deliberately narrow approval identity** — the credential that can approve and merge a reviewed pull request is not the same credential used for day-to-day development, and it is walled off from the irreversible-action list above by design, not by convention or a sticky note on a monitor.
- **A credential-escalation ladder instead of a "just ask" habit** — before ever pinging me for access, an agent works through checking its current identity, re-authenticating, minting a fresh scoped token, and verifying that token actually covers what is needed. I only get asked when a credential is missing outright — a brand-new machine with nothing set up yet, not a broken or expired one that could have fixed itself.
- **One written source of truth for public claims** — numbers, authorship, anything that could misrepresent the work gets checked against a single document instead of generated fresh each time. If the document and the code disagree, that is a stop-and-ask, not a coin flip dressed as confidence.
- **A "done" gate that outlives the merge** — for the work I track on a board, a task is not closed just because the pull request merged. A status check has to run and actually move the tracking card before anything gets reported as finished — merged code and a "done" label are not the same claim, and treating them as the same claim is how demos become status reports.

None of this is exotic tooling. It is the same shape any well-run engineering org already uses for humans — reviews that block merges, credentials that are minted and scoped instead of shared, a documented source of truth instead of institutional folklore, a definition of done that is not just "the code shipped." The only thing that changed is who is operating inside the rails.

## What stays on the human path

I will not enumerate a classified list of every gate here — the point is the **shape**, and the shape is intentionally short:

![Action-class ladder: routine work can auto-merge after checks; irreversible carve-outs always pause for a human](/images/posts/human-approval-action-classes.png "Routine in the middle of the funnel. Judgment at the edges.")

*ELI10: speed lives in the middle; the human owns the edges that are hard to undo.*

- **Irreversible or hard-to-revert** actions
- **Secret and credential** surfaces
- **Ambiguous validation** — when green would be a guess
- **Public claims** that could misrepresent work, numbers, or authorship
- **Cross-repository or multi-team blast radius** that outruns a single pull-request review

Everything else can still be aggressively automated. Speed lives in the middle of the funnel. Judgment lives at the edges, which is less glamorous than "full autonomy" and much cheaper than a preventable outage.

## Where this earned its stripes

![Mac Mini Runner Visibility dashboard — host load, idle/busy runners, and 24h history of jobs, load average, and agent sessions](/images/posts/mac-runner-vis.jpg "Real fleet visibility: runners and agent sessions on the Mac Mini, not a slide-deck diagram")

This is not theoretical design. I once had a test harness for validating a security fix — the fix itself was sound, but the harness wrapped the test payload in an extra layer of shell evaluation that did not match how the real code actually ran it. That mismatch let a string that was supposed to stay completely inert get interpreted as a live command instead, and it deleted a chunk of local, unbacked-up work before anyone noticed.

Nothing production-facing was touched, and it was caught the same day through a blameless postmortem rather than buried — but it is exactly the kind of failure a "the code looked safe" review misses, because the code *was* safe; the test harness around it was not. The fix was not "be more careful" — it was structural: any test involving a potentially destructive payload now has to run inside a disposable, throwaway environment by rule, never against a real working directory, no matter how confident anyone is that the string cannot actually execute. That is the difference between a policy and a control: a policy is advice; a control does not care how sure you were.

## TPM craft, not Luddism

I spent **10+** years at Microsoft across Xbox, CSE, DX/DPE, and Reactor. Platform work taught a boring truth: **executives do not reward "we moved fast" when the outage was preventable.** They reward systems that can still say no after the demo lights go out.

Human approval in an agent system is the same craft as:

- Critical-path ownership
- Risk registers that actually change behavior
- Escalation paths that are practiced, not theoretical

On the [constellation](/about/?node=human), human approval sits **below** eval gates for a reason: automation clears what it can; people clear what it should not.

## What this is *not*

- **Not Luddism.** Agents merge plenty of routine work after checks. The merge button is selective, not a museum piece.
- **Not "agents cannot merge anything."** Autonomy is per **action class**. The middle of the funnel is allowed to be fast.
- **Not a classified dump of every gate.** You get the shape — irreversible carve-outs, decision briefs, a narrow approval identity — so you can steal the pattern without needing my private list.

## How agents should treat the human

Good agent behavior:

- Surfacing **why** a gate fired
- Packaging a **decision brief**, not a guilt trip
- Never "approving itself" by rephrasing the same session as a second reviewer

Bad agent behavior:

- Burying risk in confidence language
- Retrying until a check flaps green
- Treating human delay as a bug instead of a control

The tell, either way, is what happens when a check fails or a gate fires. A well-built agent stops, states plainly what it found and why it stopped, and hands over a decision instead of a demand. A poorly-built one starts negotiating with the gate — rephrasing the same result until something looks green, or treating "wait for a human" as a bug to route around instead of the point of the architecture.

## How to start (stealable)

1. **Classify actions** into routine vs irreversible (and anything with secret or public-claim blast radius).
2. **Automate the middle** — after real checks, let a narrow approval identity merge boring work.
3. **Carve irreversible** — force-push, secrets, data-destructive, production infrastructure, external sends always pause.
4. **Require decision briefs** — when a gate fires, the agent packages why, what it checked, and what you must decide.

Later posts in this series lean on the same shape: [Landing floor without a GitHub App](/posts/landing-floor-without-a-github-app/), [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/), [Claim safety: evidence before metrics](/posts/claim-safety-evidence-before-metrics/).

**Bottom line:** if your architecture has no place for a human to say no, you did not build a production system. You built a demo with continuous-integration cosplay.
