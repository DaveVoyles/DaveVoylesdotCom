+++
draft = true
title = 'Two brains, two jobs: Bender engineers, Maya assists'
author = 'Dave Voyles'
description = 'One mega-agent blurs coding and calendar work — split the roles, give each brain its own door, and prove both still answer with a fresh nonce.'
categories = ['Programming', 'AI']
tags = ['Pattern', 'Build-log', 'agents', 'role-split', 'Hermes', 'OpenClaw', 'CI', 'smoke-tests']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/two-brains-bender-maya-cover.png'
alt = 'Two separate workbenches — an engineering bench and a personal-assistant desk — each with its own door and a shared smoke-test stamp'
caption = 'Two jobs, two doors — one brain that does everything is a coordination problem dressed as convenience.'
+++

I used to want one agent that could do everything.

Write the PR, tidy the calendar, answer Slack, review the diff, remind me about lacrosse pickup — one conversational surface, one “brain,” one place to yell when something was wrong. It felt efficient until the failures started rhyming. Coding work leaned on personal-assistant shortcuts. Calendar noise interrupted engineering focus. A gateway that looked like a helpful front door became a noisy hallway where every request sounded the same, and “the agent is up” stopped meaning either job was actually done.

The stealable pattern is not “buy a bigger model.” It is **two brains, two jobs**: one engineering orchestrator, one personal assistant, on different hosts, with **direct doors** instead of one mega-gateway, plus **capability smokes**. Smokes are short nonce capability checks that prove each brain’s door answers, not that a process is running. A fresh nonce ping makes “reachable” a proof, not a vibe. In my fleet I extend and operate Hermes as the engineering side (**Bender**) and OpenClaw as the personal-assistant side (**Maya**). I did not invent those platforms — I wire them, name them clearly, and refuse to let one identity pretend it owns both jobs.

If you get this wrong, you buy a mega-agent that is busy and still incoherent. Executives hear “we have agents.” Implementers inherit a single process that cannot fail closed on the right job, because nobody agreed which job it was.

## In brief

- One mega-agent optimizes for a single chat surface; two brains optimize for **role clarity**.
- Name the jobs: **engineering orchestrator** vs **personal assistant**.
- Different **hosts** when work and blast radius differ; **direct doors** over noisy shared gateways.
- Prove both with **capability smokes** — a fresh nonce both brains must echo.
- Engineering review on **its own runner**, fail loud when credentials are missing, **never merge** — a separate bot-run lands approved work.
- Steal the rule: split roles, separate doors, smoke what you claim.

## Words I use below

- **Engineering orchestrator.** Coding brain — plans, reviews, repo-facing jobs. Here: Hermes as **Bender**.
- **Personal assistant (PA).** Calendar, reminders, life logistics — no merge authority. Here: OpenClaw as **Maya**.
- **Direct door.** Clear entry into one brain for one job, not a shared lobby with one voice.
- **Gateway.** Front process that routes traffic; useful until it becomes the product.
- **Smoke / smokes (capability smoke / fresh nonce).** Short nonce capability checks that prove each brain’s door answers, not that a process is running. Echo a one-time value so cached “I’m fine” cannot fake today.
- **Own runner.** Self-hosted Actions runner labeled for the job you mean.
- **Fail loud.** Missing credentials or a dead door go red (or skip with a named reason).
- **Role split.** Two named jobs with two identities — not one agent with a longer prompt.

![Two brains, two doors: mega-agent lobby versus Bender and Maya with direct doors and nonce smokes](/images/posts/two-brains-bender-maya-two-doors.png)

<!-- figure: primary — two actors, two doors, smoke nonce; blue human · purple Bender · purple Maya · teal verified · coral conflation · gray hosts -->

## Situation

I extend and operate a small agent fleet on a homelab — roughly the same **20+** Docker-container world I write about elsewhere, plus coding agents and PA surfaces. The temptation was obvious: one stack, one identity, one place to configure tools. Docs drifted. Names drifted. “Hermes” meant engineering on one machine and something softer on another. Review jobs borrowed runner labels that belonged to nobody. A convenience gateway started answering for both jobs badly.

The settling move was boring on purpose. Rename and document so **Bender** is the Hermes engineering orchestrator on the Mini-class host, and **Maya** is the OpenClaw personal assistant on the Pro-class host. Park noisy shared gateways. Give each brain a direct door. Add smokes that ping both with a fresh nonce. On the engineering side, land unattended PR review on a distinct runner identity, teach CI to fail loudly when the review credential is missing (so “no secret” and “review passed” never look the same), and keep the rule that the **reviewer never merges** — a separate bot-run lands approved work.

No private hostnames, Tailscale URLs, or credential values on a public post. The pattern is the point: role split, doors, smoke, fail-loud review without merge authority.

![Teaching diagram of two doors: Bender engineering surface versus Maya PA surface. Illustration, not a product screenshot.](/images/posts/two-brains-bender-maya-dashboards.png "Teaching illustration of two doors, not a product screenshot.")

<!-- figure: teaching — two dashboards / two doors; purple Bender + Maya; gray hosts; teal doors; labeled illustration, not a product shot -->

## Why it matters

Executives hear “one agent OS” and picture leverage. Implementers hear “one process that owns coding *and* my calendar” and picture thrash. Those are not the same sentence.

Why now: platforms are good enough that the failure mode is no longer “it cannot code” or “it cannot remind.” The failure mode is **conflation** — the same identity holds merge-adjacent power and household logistics, shares a gateway that remixes intent, and reports “up” when only one half answered. Separate jobs make separate failures visible. You can fail closed on review credentials without taking down reminders. You can smoke the PA without pretending a green calendar ping proved the engineering door.

The cost of wrong is folklore with a friendly chat UI. Busy is not the same as on the critical path for either job.

## Decision

**Prefer two named brains with two doors over one mega-agent with a clever prompt.** Different hosts when blast radius differs. Smoke both with a fresh nonce. On the engineering brain, unattended review on its own runner, fail loud when credentials are missing, and never let the reviewer own the merge button.

| Approach | What it optimizes | What breaks |
| :--- | :--- | :--- |
| One mega-agent, one gateway | Single chat surface | Roles blur; every failure looks the same |
| Same host, two prompts | Less hardware ceremony | Blast radius and focus still shared |
| Shared runner labels for review | Copy-paste CI | Jobs queue forever or review the wrong world |
| Green when credential missing | Quiet dashboards | “Review passed” means “we never asked” |
| **Two brains, direct doors, nonce smokes, fail-loud review (no merge)** | Clear jobs + trustworthy red/green | Slightly more naming — worth it |

![Decision poster: noisy gateway hallway versus two quiet doors with nonce tickets](/images/posts/two-brains-bender-maya-decision.png)

<!-- figure: decision — amber “same brain?” → coral mega-agent vs teal Bender/Maya doors + nonce chip -->

## System model

1. **Human** (blue) assigns jobs, reads smokes, keeps merge authority.
2. **Bender** (purple) — engineering orchestrator on its host — coding work and review CI for that world.
3. **Maya** (purple) — PA on its host — does not own merge.
4. **Doors** (gray → teal when healthy) — direct entries; parked gateways optional, not the default product.
5. **Smokes** (amber → teal echo / coral silence) — fresh nonce from the brain you meant to ping.
6. **Review path** (amber) — own runner; missing credential → coral fail-loud; approval does not merge; separate bot-run lands approved PRs.

The interesting arrow is **separation**: coral when a request hits the wrong door, teal only when the smoke proves the intended door answered.

![System model: human, Bender, Maya, doors, smokes, and fail-loud review path](/images/posts/two-brains-bender-maya-system-model.png)

<!-- figure: system model — blue human; purple Bender + Maya on separate gray hosts; doors; dashed gateway; nonce arrows; fail-loud / no-merge badges -->

## Implementation detail

You do not need my fleet names to steal the shape.

1. **One sentence split.** “Brain A engineers. Brain B assists.” Hedge means you do not have a split yet.
2. **Name identities in docs operators actually read.** Platform ≠ role.
3. **Different hosts when jobs differ.** Thrash and blast radius should not be shared by default.
4. **Direct doors first.** A gateway is a router, not a personality — park it when every request exits as one voice.
5. **Nonce smokes for both brains.** Cache-free proof beats “process is running.”
6. **Own runner for review.** Unmatched labels queue forever and look merely slow.
7. **Fail loud on missing review credentials.** Carve out only named cases; silence is a choice.
8. **Reviewer never merges.** Approval is a signal; a narrower bot-run lands approved work.
9. **Honest verbs.** “Extended and operates” for upstream agent platforms — not “I built the framework.”

## Failure modes

1. **Mega-agent prompt soup** — longer instructions, same conflation. **Fix:** two names, two doors.
2. **Gateway as product** — one lobby, one voice. **Fix:** direct doors; park when noisy.
3. **Same-host thrash** — PA noise vs engineering focus. **Fix:** different hosts when blast radius differs.
4. **Smoke theater** — process up ≠ brain answered. **Fix:** fresh nonce from the intended door.
5. **Review green without credentials** — missing secret looks like pass. **Fix:** fail loud; name carve-outs.
6. **Reviewer merges** — approval becomes ship. **Fix:** separate land step.
7. **Wrong-brain routing** — calendar on the engineering door (or reverse). **Fix:** role checks; coral on conflation.

![Failure modes: wrong-brain routing, smoke theater, and fail-loud missing credentials](/images/posts/two-brains-bender-maya-failure-modes.png)

<!-- figure: failure modes — coral tiles with teal fixes; light canvas; night-console optional on fail-loud tile only -->

## Put it into practice

1. Name your engineering brain and your PA brain in one sentence.
2. Put those names in operator docs people actually open.
3. Inventory doors: direct vs shared gateway vs park.
4. Add a nonce smoke per brain; alert on silence, not only process death.
5. Map review CI to an online runner label you own.
6. Missing review credentials fail loudly — or skip with a named carve-out.
7. Confirm the reviewer cannot merge; name what lands approved PRs.
8. Run one wrong-brain drill; require coral.
9. Operator rule: two jobs, two doors, prove both.

## Next in the system

This is the **role-split and doors** layer — sibling to honest fleet gates and prove-before-floor, not a remake of Mission Control, ops dashboards, or a control-plane home screen. The steal is narrower: stop asking one agent to be your engineer and your chief of staff in the same breath.

If your agents are fluent and your identities are politely lying about which job they own, you still have folklore — just folklore with two chat tabs that were secretly one.

**Bottom line:** two brains, two jobs — Bender engineers, Maya assists — direct doors, nonce smokes, and review that can fail loud without ever owning the merge button.
