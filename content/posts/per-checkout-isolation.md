+++
date = '2026-09-18T09:00:00-04:00'
draft = true
title = 'Per-checkout isolation so parallel agents stop sharing one /tmp'
author = 'Dave Voyles'
description = 'When two agents share fixed scratch paths, receipts and tests lie about which work they came from — make the checkout the isolation unit, not the product name.'
categories = ['Programming', 'AI']
tags = ['AI agents', 'isolation', 'worktrees', 'harness', 'ops', 'Pattern']
topics = ['Tech']
[cover]
image = "/images/posts/per-checkout-isolation-cover.png"
alt = 'Two agent work lanes with separate scratch trays instead of one shared /tmp bin'
caption = 'Isolation unit is the checkout. Shared fixed paths are how parallel agents clobber each other.'
+++

Two coding agents on the same machine will happily invent the same filenames, write the same “temporary” paths, and then argue about whose receipt is whose.

I learned that the boring way: launch parallel work, watch tests and push gates read unbound or fixed scratch, and discover that “green” was sometimes just whoever finished last painting over `/tmp`. The isolation unit was wrong. People reach for product names, container names, even agent display names — anything that sounds like a fence. The fence that actually worked was smaller and duller: **the checkout**. One worktree, one scheme for artifact classes, receipts that follow that environment, and tests that refuse to collide on a shared fixed path.

If you get this wrong, parallel agents do not merely slow each other down. They cross-contaminate evidence. A receipt that cannot name its checkout is folklore. A push gate that falls back to “whatever is lying around” will bless the wrong stack. That is the cost: you stop being able to trust the paper trail you built the agents to produce.

![Shared fixed /tmp vs per-checkout isolation](/images/posts/per-checkout-isolation-shared-vs-checkout.png)

*ELI10: left path — two purple agents dump into one gray `/tmp` bin and coral-block each other; right path — each checkout gets its own teal-verified scratch tray.*

## In brief

- Parallel agent work fails quietly when receipts, temp files, and test output share **fixed or unbound** paths.
- Treat the **checkout** (the concrete worktree / clone the agent is in) as the isolation unit — not the product nickname.
- Give every artifact class a per-checkout home: receipts, session notes, temp, and anything a gate will later read.
- Make push and prove steps **fail closed** when the environment is unbound; do not “helpfully” fall back to a shared folder.
- Keep a session ledger **observational** — it records what happened in that checkout; it is not a second authority that invents success.

## Words I use below

- **Checkout.** The concrete working tree the agent is editing — a clone, worktree, or checked-out branch directory with a real path on disk.
- **Artifact class.** A kind of leftover the system must keep straight: receipts, temp files, test output, session notes, push evidence.
- **Receipt.** A small, durable record that a step actually ran in a named environment — not a chat summary of what the agent meant to do.
- **Unbound path.** A location that is not tied to the current checkout (shared `/tmp` names, home-directory defaults, “first folder we find”).
- **Session ledger.** An observational log of what this checkout’s session did — useful for debugging, never a substitute for a prove step.
- **Isolation unit.** The thing you fence. Here it is the checkout, not the product name on the README.

## Situation

I run coding agents against real repos on real machines. That means worktrees, parallel sessions, and a habit of letting more than one agent touch related problems in the same afternoon. The failure mode is not science fiction: Agent A writes a prove receipt under a fixed temp name; Agent B overwrites it; a push gate reads the leftover and smiles.

The interesting ships in this pattern were not “more agents.” They were the dull plumbing: a per-checkout scheme that owns every artifact class, receipts that follow the environment instead of a global default, an observational session ledger scoped to the checkout, and tests that stop colliding on fixed `/tmp`. The fleet side then re-synced the same libraries so worktrees there stayed separate too. Same shape, two homes.

I am not going to paste private repo URLs or invent how many agents I run. The stealable part is the unit of isolation.

## Why it matters

Executives hear “multi-agent” and picture throughput. Implementers hear “multi-agent” and picture two shells fighting over the same scratch file. Both are right about the aspiration, and both lose when the filesystem is the shared memory nobody designed.

Why now: agent tooling got good enough that parallel work is the default temptation, not a rare experiment. Why this decision: once you treat product names as the fence, you will keep discovering shared paths that never learned the product name — `/tmp`, CI caches, “default receipt dir,” the helpful fallback that made a demo look smooth.

The stakes are trust, not aesthetics. If the receipt can lie about which checkout produced it, every gate downstream is theater with better fonts.

## Decision

**Make the checkout the isolation unit.** Name artifact paths from the checkout’s identity. Ban shared fixed scratch for anything a gate will later read. Prefer fail-closed when the environment cannot prove which checkout it is in.

| Approach | What it optimizes | What breaks |
| :--- | :--- | :--- |
| Shared fixed `/tmp` (or one global receipt dir) | Demo speed; fewer path arguments | Parallel clobber; wrong receipt wins; flaky tests |
| Isolate by product / agent display name | Branding clarity | Paths that never heard the brand; two checkouts of the same product still collide |
| **Per-checkout scheme for every artifact class** | Honest parallel work; receipts that mean something | Slightly more path discipline up front — worth it |

That middle row is the trap I want named out loud. Product names feel like boundaries. They are labels. The boundary is the directory the agent can actually write.

![Checkout owns every artifact class](/images/posts/per-checkout-isolation-artifact-classes.png)

*Visual grammar: gray infra checkout box; purple agent inside; teal trays for receipts / temp / ledger / tests — each labeled as verified per-checkout, not shared.*

## System model

Picture three actors and a few gates.

1. **Human** (blue) opens or assigns a checkout — a real path, not a vibe.
2. **Agent** (purple) works only inside that checkout’s scheme for artifact classes.
3. **Infra** (gray) is the machine: disks, `/tmp`, runners. Infra is shared. That is exactly why you must not let artifact classes default into unbound infra paths.
4. **Prove / push gate** (amber while reviewing, teal when verified, coral when blocked) reads receipts that name the checkout. If the path is unbound, the gate blocks — it does not go hunting for a friendly leftover.

The session ledger sits beside this as a camera, not a judge. It observes what the session did in that checkout. It does not get a vote that overrides a red prove.

![Receipts follow the environment; unbound fallback is coral-blocked](/images/posts/per-checkout-isolation-receipts-follow-env.png)

*Left: amber review finds an unbound receipt path and coral-blocks. Right: teal-verified receipt is scoped to the checkout the purple agent actually used.*

## Implementation detail

You do not need my harness to steal the shape. You need a boring checklist implemented in whatever language you already ship.

**1. Define the scheme once.** For a given checkout root, compute deterministic homes for each artifact class: receipts, temp, session ledger, test scratch. Prefer paths under the checkout or under a host cache that includes a checkout id — not ` /tmp/agent-receipt.json` with a wink.

**2. Teach every writer the scheme.** Hooks, prove steps, push helpers, and tests should call one library (or one function) to ask “where does this class live for *this* checkout?” If two tools invent paths independently, you will re-create the collision in a week.

**3. Thread the environment into receipts.** A receipt should be able to answer: which checkout, which step, what outcome. If a receipt cannot name its checkout, treat it as incomplete — same family of bug as a green check that never asked whether the service was alive.

**4. Kill unbound fallbacks in gates.** The “helpful” branch that says “if we cannot find a per-checkout receipt, look in the old global folder” is how wrong evidence gets promoted. Fail closed. Make the operator fix the wiring. Painful once; cheaper than debugging a blessed lie.

**5. Keep the session ledger observational.** Useful for “what did this session touch?” Dangerous if someone starts treating “ledger says we pushed” as proof. Proof is the prove step. The ledger is the diary.

**6. Re-sync the same libs wherever worktrees live.** Isolation that exists in one repo’s hooks but not in the fleet/worktree host is a part-time fence. Same scheme, both places, or you will watch collisions migrate to the machine you forgot.

**7. Test for collision on purpose.** Have two checkouts write the same artifact class in parallel in CI or a local smoke. If either can overwrite the other, the scheme is unfinished.

## Failure modes

These are the ones I care about naming before someone “simplifies” the paths again.

### 1. Fixed `/tmp` friendship

Two agents, one predictable temp filename, last writer wins. Tests flake in a way that looks like timing. Gates look haunted. **Fix:** per-checkout temp roots; never a repo-wide constant path for prove output.

### 2. Unbound fallback that “just works”

A push gate cannot resolve the checkout-scoped receipt, so it reads a legacy global file and continues. Demo green. Production folklore. **Fix:** coral-block on unbound; delete the fallback; fix callers.

### 3. Ledger promoted to authority

Someone wires automation that treats the session ledger as proof of push or proof of tests. The ledger was a camera. Now it is a forged badge. **Fix:** ledger read-only for humans and debug tools; gates read receipts that were proved, not diary lines.

### 4. Product-name fencing

Folders named after the product, shared across every checkout of that product. Feels organized. Still a shared scratch bin. **Fix:** checkout id in the path; product name is a label, not a directory strategy.

### 5. Half-migrated hosts

Harness checkouts are isolated; fleet worktrees still share old libs. Collisions “mysteriously” only happen on one machine. **Fix:** re-sync the scheme everywhere parallel work can start.

![Five failure modes on one glance](/images/posts/per-checkout-isolation-failure-modes.png)

*Coral tiles for the false paths; teal note under each for the fix. Purple agent icon only appears inside a checkout-scoped box — never floating over shared gray `/tmp`.*

## Put it into practice

1. **Inventory paths your agents write** that a gate might later read — receipts, temp, test output, push evidence.
2. **Mark each path** checkout-scoped, product-scoped, or unbound. Unbound and product-scoped are debt.
3. **Pick one checkout id** you can compute the same way from hooks and from tests (path hash, worktree name, git common-dir key — consistency beats cleverness).
4. **Move one artifact class first** (usually receipts). Prove two parallel checkouts cannot clobber it.
5. **Delete unbound fallbacks** in the gate that consumes that class. Watch who complains; that list is your migration queue.
6. **Add a collision smoke** that fails the build if two checkouts share a writable artifact path.
7. **Write the rule in AGENTS.md / operator docs:** isolation unit = checkout; ledger ≠ proof.
8. **Re-sync the library** on every host that starts agent worktrees — partial fences are how this bug regenerates.

## Next in the system

This pattern sits beside prove-before-floor and dead-man heartbeats, not on top of them. Prove-before-floor asks whether a hook actually works before it becomes policy. Heartbeats ask whether silence means dead. Per-checkout isolation asks whether the evidence those systems consume can be attributed to the worktree that produced it.

If your gates are honest but your paths are shared, you still have folklore — just folklore with CI badges. Fix the unit of isolation first, then the proves have something true to read.

**Bottom line:** parallel agents need a fence; the checkout is the fence; shared `/tmp` is how you pretend you built one.
