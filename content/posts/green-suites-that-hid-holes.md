+++
date = '2026-09-22T09:00:00-04:00'
draft = true
title = 'Green suites that hid holes: fleet gates that plant failure'
author = 'Dave Voyles'
description = 'CI that stays green, runners that never start, and LaunchAgents aimed at deleted paths look like health — until you plant failure and watch which checks refuse to go red.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'CI', 'fleet', 'fail-closed', 'LaunchAgents', 'self-hosted runners', 'ops']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/green-suites-that-hid-holes-cover.png"
alt = 'A bright green status panel beside an open LAN hatch the suite never checked'
caption = 'False confidence is worse than no check — green can mean we never asked the hard question.'
+++

I have shipped test suites that were green for the life of a repo and still left a hole on the LAN.

Not because anyone was careless in a dramatic way. Because the suite asked the easy spelling of the question, CI never ran the suite that looked like coverage, a workflow asked for a runner label no machine had registered, and a closeout treated a missing preflight as “gates okay, push to main.” The badges stayed cheerful. The machine disagreed.

The stealable pattern is not “write more tests.” It is **honest gates**: plant a failure that must go red and name the phase, refuse missing-as-pass, and check pairings the operating system will never notice for you — bind addresses that mean all interfaces, LaunchAgents still pointed at deleted paths, runner labels that map to nothing online.

If you get this wrong, you buy false confidence. Teams stop looking. Executives read green and schedule the next feature. Implementers learn not to trust the dashboard. That is the cost of wrong: a system that looks operated while the hole stays open.

![Green badge beside an unchecked LAN bind hole](/images/posts/green-suites-that-hid-holes-green-vs-hole.png)

*ELI10: left — a teal PASS sticker on a gray box while a coral LAN hatch sits open behind it; right — an amber planted-failure gate flips coral and names the phase that actually broke.*

## In brief

- Green suites can hide **bind-all** servers, **never-run** coverage, and receipts that only work when CI exports the right env.
- Splitting a huge smoke into phases is good — until `return 1` becomes a no-op inside a helper and PASS still prints.
- Workflows that ask for **runner labels no registered runner has** sit `queued` forever; GitHub does not fail them red for you.
- Missing preflight is not a passed gate. WIP only with an explicit flag.
- LaunchAgents keep aiming at **deleted or worktree paths**; launchd notices process death, not stale `ProgramArguments`.
- Steal the rule: **plant failure**, **refuse missing-as-pass**, and **verify pairings** the OS will never check.

## Words I use below

- **Bind-all.** A listen address the OS treats as every network interface — including `0`, `::0`, and some zero-padded forms people think look local.
- **Planted failure.** A deliberate bad case a gate must catch and name; if PASS still prints, the gate is theater.
- **Runner label.** A GitHub Actions tag that must match a registered self-hosted runner; mismatch means queued forever, not red.
- **Fail-closed.** Missing or unverified means stop — not smile and continue.
- **LaunchAgent.** A macOS launchd job from a plist; it can keep aiming at a path you already deleted.
- **Worktree.** A linked git working directory where `.git` is often a **file** — locks that assume “`.git` is a folder” lie.
- **Gate honesty.** PASS only when everything claimed was verified; otherwise SKIP, PARTIAL, or red.

## Situation

I extend and operate a small fleet of agent and ops machines — CI, smokes, closeouts, LaunchAgents. In one hardening pass we fixed related lies: a feed server that accepted bind-all forms a helper elsewhere already rejected; self-tests that only tried the spelling that already worked; suites that looked like coverage but CI never invoked; receipts written to the wrong tree because an env var was read at **import**, not at **write** (green under CI that exported the var, broken under launchd and hand runs).

We split one enormous live smoke into named phases — and nearly shipped a version where helpers swallowed `return 1` while assertion counts stayed equal and PASS still printed. The fix was raising, plus a planted-failure gate that **must** go red and name the phase.

Same theme: workflows with runner labels no registered runner had, jobs `queued` forever; closeout treating missing preflight as gates okay; LaunchAgents aimed at deleted or worktree-rooted paths; a sweeper lock that assumed `.git` was a directory and lied about another invocation; a check that printed PASS when it checked nothing.

No private repo URLs, runner ids, or invented uptime hours here — just the failure mode and the design rule.

## Why it matters

Executives hear “green CI” as readiness. Implementers hear “the jobs that ran did not fail.” Those are not the same sentence. In an agent OS — humans, coding agents, and machines that keep running when nobody is watching — the second sentence is what you bought.

Why now: automated closeouts, self-hosted runners, and long-lived LaunchAgents make dashboards prettier and holes quieter. Why this decision: missing-as-pass, PASS-with-zero-checks, and “queued means in progress” train the org to stop poking dark corners. If a suite cannot go red on a planted failure, it cannot protect you from the unplanted ones.

## Decision

**Prefer honest gates over comforting greens.** Plant failures that name the broken phase. Treat missing preflight as blocked. Require every workflow label set to map to an online registered runner — skip loudly when you could not verify. Enumerate LaunchAgent paths and fail on missing or worktree-rooted targets. PASS only when the claimed surface was checked.

| Approach | What it optimizes | What breaks |
| :--- | :--- | :--- |
| Suite tests only the happy bind spelling | Fast green | Bind-all forms the OS still accepts |
| Huge smoke with stable assertion counts | One number to watch | Helpers swallow `return 1`; PASS lies |
| Assume queued means running | Less anxiety | Jobs that never start |
| Missing preflight = continue / push | Demo closeouts | WIP on main |
| **Planted failure + fail-closed pairings** | Trustworthy red/green | Slightly more ceremony — worth it |

![Decision: planted failure and fail-closed vs comforting green](/images/posts/green-suites-that-hid-holes-decision.png)

*Visual grammar: amber review asks “did we plant failure?” — teal only if the planted case went coral and named the phase; gray missing-script tiles go coral, never teal by default.*

## System model

1. **Human** (blue) merges workflows, installs LaunchAgents, reads dashboards.
2. **Agent / automation** (purple) runs smokes, closeouts, sweepers.
3. **Infra** (gray) is interfaces, launchd, runners, the LAN — indifferent to badge color.
4. **Gates** (amber → teal or coral) ask narrow questions: bind helper reject bind-all? planted phase named? every label online? every plist path real? preflight present and green?

The OS notices a dead process. It does not notice stale `ProgramArguments`. GitHub leaves unmatched jobs `queued`. Suites stay green if they never spell the dangerous bind form. Gates check the pairings infra will not check for you.

![System model: humans, agents, infra, and honesty gates](/images/posts/green-suites-that-hid-holes-system-model.png)

*ELI10: purple automation and blue human both point at gray infra; amber gates on the arrows go coral when bind, runner, plist, or preflight pairing fails, teal only after verification.*

## Implementation detail

You do not need my fleet to steal the shape.

1. **One bind helper, every listener.** Test dangerous spellings on purpose.
2. **Coverage CI actually runs.** Orphan suites are set dressing.
3. **Read env at write time.** Import-time paths green under CI and break under launchd.
4. **Named phases + planted failure.** Raise; assert the report names the broken phase.
5. **Runner allowlist.** Map every label set to an online runner; could-not-verify ≠ verified.
6. **Closeout fail-closed.** Missing ≠ passed; WIP only with an explicit flag.
7. **LaunchAgent path gate.** Fail on missing or worktree-rooted targets.
8. **Sweeper lock → shared git dir.** Refuse install contexts that make the lock lie.
9. **Gate honesty.** Zero checks is SKIP or error, not PASS (0/2).

## Failure modes

1. **Green while bind-all** — self-test only tries localhost. **Fix:** shared helper + dangerous-spelling fixtures.
2. **Phase split that cannot go red** — helpers swallow `return 1`. **Fix:** raise + planted-failure gate.
3. **Queued forever** — labels match no online runner. **Fix:** allowlist; loud skip when unverifiable.
4. **Missing-as-pass closeout** — no preflight → push. **Fix:** missing = blocked; explicit WIP flag.
5. **LaunchAgent ghost path** — plist aims at a deleted checkout. **Fix:** enumerate plist paths.
6. **Sweeper blind to worktrees** — assumes `.git` is a directory. **Fix:** lock on shared git dir.
7. **PASS that checked nothing** — PASS (0/2). **Fix:** PASS requires verification.

![Failure modes: coral tiles with teal fixes](/images/posts/green-suites-that-hid-holes-failure-modes.png)

*Coral tiles for false greens; teal underline for each fix. Light canvas preferred; night-console optional on one fail-closed row only.*

## Put it into practice

1. Confirm one bind helper and bind-all fixtures on every listener.
2. Trace each coverage suite to a workflow job that runs it.
3. Add one planted failure; require the phase name in the report.
4. Inventory workflow labels against online registered runners.
5. Block push on missing or failing preflight unless WIP is explicit.
6. Enumerate LaunchAgent or systemd paths; fail on missing targets.
7. Audit locks for “`.git` is a directory” assumptions.
8. Ban PASS when zero checks ran.
9. Write the operator rule: false confidence is worse than no check.

## Next in the system

This is the **machine and fleet layer** — CI, runners, LaunchAgents, bind — sibling to dead-man heartbeats and container false-greens, not a remake of either. Prove-before-floor asks whether a hook works before it becomes policy. Per-checkout isolation asks whether evidence belongs to the worktree that produced it. Honest fleet gates ask whether green means you asked the hard question.

If your agents are smart and your machines are politely lying, you still have folklore — just folklore with a status page.

**Bottom line:** false confidence is worse than no check — plant failure, refuse missing-as-pass, and verify the pairings your OS will never notice.
