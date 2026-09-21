+++
date = '2026-09-22T09:00:00-04:00'
draft = true
title = 'Green suites that hid holes: fleet gates that plant failure'
author = 'Dave Voyles'
description = 'A green check can look like health while a real hole stays open — until you plant a failure on purpose and watch whether the alarm actually rings.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'CI', 'fleet', 'fail-closed', 'LaunchAgents', 'self-hosted runners', 'ops']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/green-suites-that-hid-holes-cover.png'
alt = 'A bright green status panel beside an open LAN hatch the suite never checked'
caption = 'False confidence is worse than no check — green can mean we never asked the hard question.'
+++

I have shipped test suites that were **green** for the life of a repo and still left a hole on the LAN.

By **green** I mean the dashboard color everyone treats as “safe to ship” — the check passed, the badge is cheerful, nobody is paging. **CI** (continuous integration) is the automated check-runner that usually paints that color: on every push or pull request it runs a suite of tests and jobs, then reports pass or fail. Green CI is valuable when it asked the hard questions. It is dangerous when it only asked the easy ones, or never ran the suite that looked like coverage.

Not because anyone was careless in a dramatic way. Because the suite asked the easy version of the question, CI never ran the suite that *looked* like coverage, a job waited forever for a machine that was never online, and a “ship it” checklist treated a missing pre-check as “gates okay.” The badges stayed cheerful. The machine disagreed.

The stealable pattern is not “write more tests.” It is **honest gates**: plant a failure that must go **red** (fail loudly) and say *which* step broke, refuse to treat “we skipped that check” as a pass, and verify the boring pairings your operating system will never notice for you — a service listening on the whole network when you thought it was local-only, a scheduled job still aimed at a folder you deleted, a CI job that never starts because no machine claims its tag.

If you get this wrong, you buy false confidence. Teams stop looking. Executives read green CI as readiness and schedule the next feature. Implementers learn not to trust the dashboard. That is the cost of wrong: a system that looks operated while the hole stays open.

![Green badge beside an unchecked LAN bind hole](/images/posts/green-suites-that-hid-holes-green-vs-hole.png)

*Green can mean “we never asked.” Plant a failure that must go red and name the phase — if it stays green, the suite is theater.*

## In brief

- A **green** check (CI saying “all clear”) can hide a real hole — the suite never asked the hard question, or never ran at all.
- A **smoke** here is a quick live health check, like tapping a smoke detector to prove the alarm still rings — not a full fire drill. Splitting a big smoke into steps is good until a step can fail silently and the report still says PASS.
- Some CI jobs wait forever for a machine that is not online. Waiting is not the same as failing — and it is not the same as healthy.
- A missing pre-check is not a passed gate. If you still need to ship unfinished work, say so with an explicit flag — do not pretend the gate cleared.
- Scheduled jobs on a Mac can keep aiming at folders you already deleted. The system notices when a process dies; it does not notice a stale path in the job file.
- Steal the rule: **plant a real failure** so you know the alarm works, **never treat missing as pass**, and **check the pairings** your OS will not check for you.

## Words I use below

- **CI (continuous integration).** The automated check-runner on your repo — usually GitHub Actions or similar — that runs tests and jobs on push or pull request and reports pass or fail. It is the machine that paints the badge executives glance at.
- **Green.** A passing CI result: the jobs that ran did not fail. Useful when those jobs asked the hard question; misleading when they skipped it, never started, or treated “missing” as “okay.”
- **Red.** A failing CI result — the gate refused to pass. Honest systems can go red on purpose (a planted failure) so you trust them when they stay green.
- **Smoke (health check).** A short live check that something still answers — like tapping a smoke detector. It is not a full security audit; it is proof today’s alarm still rings.
- **Bind-all.** A listen address the OS treats as every network interface — including forms people think look local-only. Detail for implementers later; the exec takeaway is “open on the whole network when we meant private.”
- **Planted failure.** A deliberate bad case a gate must catch and name; if PASS still prints, the gate is theater — like testing a fire alarm by holding a match under it.
- **Runner label.** A tag that must match a machine registered to run CI jobs; mismatch means the job waits forever instead of going red.
- **Fail-closed.** Missing or unverified means stop — not smile and continue.
- **LaunchAgent.** A macOS scheduled job (a small config file the system loads at login). It can keep aiming at a path you already deleted.
- **Worktree.** A second working copy of the same git repo. Locks that assume “`.git` is always a folder” can lie here.
- **Gate honesty.** PASS only when everything claimed was verified; otherwise SKIP, PARTIAL, or red.

## Situation

I extend and operate a small fleet of agent and ops machines — CI, smokes, closeouts, LaunchAgents. In one hardening pass we fixed related lies: a feed server that accepted bind-all forms a helper elsewhere already rejected; self-tests that only tried the spelling that already worked; suites that looked like coverage but CI never invoked; receipts written to the wrong tree because an env var was read at **import**, not at **write** (green under CI that exported the var, broken under launchd and hand runs).

We split one enormous live smoke into named phases — and nearly shipped a version where helpers swallowed `return 1` while assertion counts stayed equal and PASS still printed. The fix was raising, plus a planted-failure gate that **must** go red and name the phase.

Same theme: workflows with runner labels no registered runner had, jobs `queued` forever; closeout treating missing preflight as gates okay; LaunchAgents aimed at deleted or worktree-rooted paths; a sweeper lock that assumed `.git` was a directory and lied about another invocation; a check that printed PASS when it checked nothing.

No private repo URLs, runner ids, or invented uptime hours here — just the failure mode and the design rule.

## Why it matters

Executives hear “green CI” as readiness — the plan is healthy; ship the next thing. Implementers hear “the jobs that ran did not fail,” which is narrower and sometimes emptier. Those are not the same sentence. In an agent OS — humans, coding agents, and machines that keep running when nobody is watching — the second sentence is what you bought.

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

*Comforting green optimizes for quiet dashboards. Planted failure + fail-closed optimizes for a red you can trust.*

## System model

1. **Human** (blue) merges workflows, installs LaunchAgents, reads dashboards.
2. **Agent / automation** (purple) runs smokes, closeouts, sweepers.
3. **Infra** (gray) is interfaces, launchd, runners, the LAN — indifferent to badge color.
4. **Gates** (amber → teal or coral) ask narrow questions: bind helper reject bind-all? planted phase named? every label online? every plist path real? preflight present and green?

The OS notices a dead process. It does not notice stale `ProgramArguments`. GitHub leaves unmatched jobs `queued`. Suites stay green if they never spell the dangerous bind form. Gates check the pairings infra will not check for you.

![System model: humans, agents, infra, and honesty gates](/images/posts/green-suites-that-hid-holes-system-model.png)

*Humans and automation both depend on the same honesty gates — network listen address, CI machine online, scheduled-job path, pre-ship checklist — because the OS will not check those pairings for you.*

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

*Each failure mode is a false green; each fix is the pairing that makes the next green mean something.*

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
