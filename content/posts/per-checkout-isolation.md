+++
date = '2026-11-01T08:00:00-05:00'
draft = false
title = 'Two agents, one /tmp, and a receipt that lied'
author = 'Dave Voyles'
description = 'Two agents sharing a fixed /tmp overwrote each other\'s receipts, and the fix was to make the checkout, not the product name, the unit of isolation.'
categories = ['Programming', 'AI']
tags = ['AI agents', 'isolation', 'worktrees', 'agent tooling', 'ops', 'Pattern']
topics = ['Tech']
[cover]
image = "/images/posts/per-checkout-isolation-cover.png"
alt = 'Two agent work lanes with separate scratch trays instead of one shared /tmp bin'
caption = 'Isolation unit is the checkout. Shared fixed paths are how parallel agents clobber each other.'
+++

Agent A writes a prove receipt under a fixed temp name. Agent B, working on a related problem the same afternoon, overwrites it. Then a push gate reads the leftover and smiles.

That is how I learned the boring way that two coding agents on the same machine will happily invent the same filenames and then argue about whose receipt is whose. I launched parallel work and watched tests and push gates read unbound or fixed scratch. "Green" was sometimes just whoever finished last painting over `/tmp`.

I had picked the wrong isolation unit, meaning the thing you fence. People reach for product names, container names, even agent display names, anything that sounds like a fence. The fence that worked was smaller and duller: **the checkout**, the actual working tree (a clone, worktree or checked-out branch directory) with a real path on disk. One worktree gets one scheme for artifact classes, receipts follow that environment, and tests refuse to collide on a shared fixed path.

When this goes wrong, parallel agents contaminate each other's evidence. A receipt, which is a small durable record that a step ran in a named environment, is folklore if it cannot name its checkout. A push gate that falls back to whatever is lying around will bless the wrong stack. After that, the paper trail the agents exist to produce stops being something you can believe.

![Shared fixed /tmp vs per-checkout isolation](/images/posts/per-checkout-isolation-shared-vs-checkout.png)

*Left: two agents share one `/tmp`, so receipts get clobbered and tests turn flaky. Right: each checkout gets its own scratch space, so gates read receipts they can trace to that checkout.*

## Where it hurt

I run coding agents against real repos on real machines. That means worktrees, parallel sessions, and a habit of letting more than one agent touch related problems in the same afternoon. The failure was not science fiction.

The fixes that mattered were dull plumbing, and none of them added agents. A per-checkout scheme now owns every artifact class: receipts, session notes, temp files, test output and push evidence. Receipts follow the environment instead of a global default. A session ledger, an observational log of what one checkout's session did, is scoped to that checkout. And the tests stopped colliding on fixed `/tmp`. I then re-synced the same libraries on the other host that starts agent worktrees, so those stayed separate too. The same scheme now lives in both places.

## Why the fence was wrong

On a slide, multi-agent means more work at once. On my machine it meant two shells fighting over the same scratch file.

Once you treat product names as the fence, you keep finding shared paths that never learned the product name: `/tmp`, CI caches, a default receipt directory, the helpful fallback that made a demo look smooth. What is at stake is trust. If a receipt can lie about which checkout produced it, every gate downstream is reading fiction.

## Pick the checkout

I make the checkout the isolation unit. Artifact paths are named from the checkout's identity. Shared fixed scratch is banned for anything a gate will later read. When the environment cannot prove which checkout it is in, the gate fails closed.

| Approach | What it optimizes | What breaks |
| :--- | :--- | :--- |
| Shared fixed `/tmp` (or one global receipt dir) | Demo speed; fewer path arguments | Parallel clobber; wrong receipt wins; flaky tests |
| Isolate by product / agent display name | Branding clarity | Paths that never heard the brand; two checkouts of the same product still collide |
| Per-checkout scheme for every artifact class | Honest parallel work; receipts that mean something | Slightly more path discipline up front, which is worth it |

The middle row is the trap. A product name sounds like a boundary, but nothing on disk enforces it. The line sits wherever the agent can really write.

![Checkout owns every artifact class](/images/posts/per-checkout-isolation-artifact-classes.png)

*One checkout owns every artifact class: receipts, temp, ledger and tests, each scoped to that checkout.*

## Who touches what

A human opens or assigns a checkout, which is a real path and not a vibe. The agent works only inside that checkout's scheme for artifact classes. The machine itself (disks, `/tmp`, runners) is shared, and that is exactly why artifact classes must not default into unbound infra paths. An unbound path is any location not tied to the current checkout, such as a shared `/tmp` name, a home-directory default or the first folder a script finds.

The prove or push gate reads receipts that name the checkout. If the path is unbound, the gate blocks. It does not go hunting for a friendly leftover. The session ledger sits beside all this as a camera and not a judge. It observes what the session did in that checkout, and it does not get a vote that overrides a red prove.

![Receipts follow the environment: an unbound fallback blesses the wrong leftover, while fail closed names the checkout or blocks](/images/posts/per-checkout-isolation-receipts-follow-env.png)

*Left: the agent cannot resolve its receipt, reads a legacy shared folder, and blesses the wrong leftover. Right: the review binds the path, the receipt names checkout A, and the gate proceeds or blocks if unbound.*

## What I changed

You need a boring checklist, built in whatever language you already ship.

Define the scheme once. For a given checkout root, compute a deterministic home for each artifact class: receipts, temp, session ledger and test scratch. Prefer paths under the checkout or under a host cache that includes a checkout id, and avoid `/tmp/agent-receipt.json` with a wink.

Then teach every writer the scheme. Hooks, prove steps, push helpers and tests should call one library, or one function, to ask where a class lives for this checkout. If two tools invent paths independently, you will re-create the collision.

Thread the environment into receipts. A receipt should be able to answer which checkout, which step and what outcome. One that cannot name its checkout is incomplete, in the same family as a green check that never asked whether the service was alive.

Kill the unbound fallbacks in gates. The helpful branch that says "if we cannot find a per-checkout receipt, look in the old global folder" is how wrong evidence gets promoted. Fail closed and make the operator fix the wiring. It is painful once and cheaper than debugging a blessed lie.

Keep the session ledger observational. It is useful for "what did this session touch?" and dangerous if someone starts treating "ledger says we pushed" as proof. Proof is the prove step. The ledger is the diary.

Re-sync the same libraries wherever worktrees live. Isolation that exists in one repo's hooks but not on the other host that runs worktrees is a part-time fence. Same scheme in both places, or you will watch collisions migrate to the machine you forgot.

Last, test for collision on purpose. Have two checkouts write the same artifact class in parallel in CI or a local smoke. If either can overwrite the other, the scheme is unfinished.

## Five ways it comes back

I want these named before someone "simplifies" the paths again.

### Fixed `/tmp` friendship

Two agents, one predictable temp filename, last writer wins. Tests flake in a way that looks like timing and gates look haunted. The fix: per-checkout temp roots, and never a repo-wide constant path for prove output.

### Unbound fallback that "just works"

A push gate cannot resolve the checkout-scoped receipt, so it reads a legacy global file and continues. The demo passes and production inherits a wrong receipt. The fix: block on unbound, delete the fallback and fix the callers.

### Ledger promoted to authority

Someone wires automation that treats the session ledger as proof of push or proof of tests. The ledger was a camera and is now a forged badge. The fix: keep the ledger read-only for humans and debug tools, and have gates read receipts that were proved, not diary lines.

### Product-name fencing

Folders named after the product, shared across every checkout of that product. It feels organized and is still a shared scratch bin. The fix: put a checkout id in the path. Keep the product name as a label on the folder.

### Half-migrated hosts

One repo's checkouts are isolated while worktrees on another host still share old libraries. Collisions "mysteriously" only happen on one machine. The fix: re-sync the scheme everywhere parallel work can start.

![Five failure modes on one glance](/images/posts/per-checkout-isolation-failure-modes.png)

*Five failure modes, each with its symptom and its fix.*

## Do this on Monday

1. Inventory the paths your agents write that a gate might later read: receipts, temp, test output and push evidence.
2. Mark each path checkout-scoped, product-scoped or unbound. Unbound and product-scoped are debt.
3. Pick one checkout id you can compute the same way from hooks and from tests. A path hash, a worktree name or a git common-dir key all work. Compute it the same way everywhere; a clever scheme computed two ways is worse than a plain one.
4. Move one artifact class first, usually receipts, and prove two parallel checkouts cannot clobber it.
5. Delete unbound fallbacks in the gate that consumes that class. Watch who complains. That list is your migration queue.
6. Add a collision smoke that fails the build if two checkouts share a writable artifact path.
7. Write the rule in AGENTS.md or your operator docs: isolation unit = checkout; ledger is not proof.
8. Re-sync the library on every host that starts agent worktrees. A fence that covers only some hosts lets this bug grow back.

## How this differs from prove-before-floor

This pattern sits beside [Prove the guard before it becomes the floor](/posts/prove-hook-before-floor/), not on top of it. Prove-before-floor asks whether a hook actually works before it becomes policy. Per-checkout isolation asks whether the evidence that system consumes can be attributed to the worktree that produced it.

If your gates are honest but your paths are shared, the receipts they read can still be wrong. Fix the unit of isolation first. After that the prove steps have something true to read.

If you take one thing from this: give each checkout its own scratch space before you add the next agent.
