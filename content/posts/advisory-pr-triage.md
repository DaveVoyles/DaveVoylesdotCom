+++
draft = true
title = 'Advisory PR triage that never owns the merge'
author = 'Dave Voyles'
description = 'A bot that comments on every PR can look like it owns the ship button — and a confidence floor that discards every typed answer is worse than no bot.'
categories = ['Programming', 'AI']
tags = ['Pattern', 'PR triage', 'advisory', 'fail-open', 'CI', 'agents', 'confidence floor']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/advisory-pr-triage-cover.png"
alt = "A PR triage path that ends in a comment and a label — never at the merge button — beside a discarded typed answer under a confidence floor"
caption = "Advisory triage stops before the ship button; a confidence floor that eats every typed answer is worse than a quiet bot."
+++

I once watched a triage bot look *alive* on a pull request while saying nothing useful.

It left a comment. It set a label. The checks looked calm enough that nobody panicked. Under the hood, every shaped answer the classifier had already produced — the kind with a real type, a score, a choice — had been thrown away by a **confidence floor**, so the public surface collapsed to **unknown**. The bot was busy. The triage was empty. That is a worse failure than a loud red check, because executives read “the bot reviewed it” and implementers inherit folklore.

The stealable pattern is **advisory PR triage that never owns the merge**: typed checks, one marker comment, one `triage/*` label, a feed note — and **nothing** that dispatches, merges, or lands from those signals. Phase 1 of the classifier stays **fail-open**. And when a confidence floor shows up, you do **not** discard answers that already have a shape. Confident silence is not caution. It is a product bug dressed as humility.

If you get this wrong, you buy either false authority (a comment that *feels* like a ship decision) or false health (a bot that posts while saying unknown forever). Both train the org to stop reading.

## In brief

- A **comment on a PR is not merge authority** — advisory triage stops before the ship button on purpose.
- Ship a narrow public surface: **typed checks**, **one marker comment**, **one `triage/*` label**, a **feed note**.
- **Nothing** should read that surface to dispatch, merge, or land. Humans keep the button (or a separate, explicitly owned land path does).
- Phase 1 classification should be **fail-open** — unknown is allowed; silent discard of shapes is not.
- A **confidence floor** that drops every typed answer to unknown makes the bot look alive while saying nothing. **Keep shaped answers** even when confidence is low.
- Steal the rule: advisory signals, typed contracts, fail-open early, never floor-away a shape you already had.

## Words I use below

- **Pull request (PR).** A proposed change waiting for review before it joins the main branch — like a change order in an inbox.
- **Merge.** Accepting that change into the main branch — the ship button. Whoever can merge owns the real risk.
- **Advisory comment.** A note the bot leaves to help humans decide. It is advice, not permission, and it must not be wired as a gate that lands the change.
- **Confidence floor.** A cutoff: if the model’s self-reported confidence sits under the line, the system treats the answer as too weak to use. Useful when it demotes mush; dangerous when it discards answers that already have a clear type.
- **Fail-open.** When the classifier is unsure, it admits **unknown** and continues without pretending it decided. Phase 1 triage prefers fail-open so a weak model does not become a silent veto.
- **Typed answer.** A classifier output with a declared shape — a named choice, a score band, a structured slot — not free-text vibes. If you already have a type, throwing it away under a floor is how you manufacture **unknown** theater.

![Typed answers discarded under a confidence floor until the public result is unknown, versus the fix that keeps the shape and badges low confidence](/images/posts/advisory-pr-triage-confidence-floor.png)

*A floor that eats every typed answer leaves a busy bot and an empty triage. Keep the shape. Show the doubt.*

## Situation

I extend and operate agent and CI paths where bots help humans triage pull requests in public. The advisory-only path is deliberately thin: **typed checks**, **one marker comment**, **one `triage/*` label**, a short **feed note**. That is the whole public surface — and **nothing** in dispatch or land reads those signals to merge. The bot may help in the thread. It must not become the merge button by accident.

Phase 1 of the classifier is **fail-open**: when it does not know, it says so. The first live run still taught a sharper lesson. A mail-style confidence floor sat under the typed outputs. Every shaped answer — structured slots, scores, choices — fell under the line and got discarded. The public result was **unknown** with cheerful activity around it. The bot looked operated. The triage was empty.

The fix was not “raise the floor until it feels safer.” The fix was **stop discarding typed answers under that floor** — keep the shape, show the low confidence. Humans can disagree with a weak typed guess. They cannot disagree with a void that pretends to be review. No private hostnames, API keys, or “N PRs triaged” metrics on a public post — ADR shape and incident shape only.

## Why it matters

Executives hear “the bot triaged the PR” and picture leverage. Implementers hear “a comment and a label appeared,” which is narrower, and sometimes emptier. Those are not the same sentence.

Why now: reusable Actions jobs make it cheap to put a voice on every PR. Cheap voices drift toward **authority creep** (wiring the advisory label into a land job “just for now”) or **confident silence** (a floor that eats every typed answer so the bot never risks being wrong — and never helps). Teams stop reading comments that always say unknown; leaders still point at the activity as proof the system is live. Dashboards look operated. The inbox stays human-only in practice.

## Decision

**Prefer advisory-only PR triage with a typed public surface, a fail-open Phase 1 classifier, and a hard rule that shaped answers survive a confidence floor.** Keep merge authority human (or on a separate, explicitly owned land path). Offer the triage job as a reusable `workflow_call` other repos can call — same contract, no private wiring required to steal the shape.

| Approach | What it optimizes | What breaks |
| :--- | :--- | :--- |
| Bot comment that also gates merge | “One system” | Comment becomes ship authority by accident |
| Untyped free-text triage only | Fast demos | No contract; hard to test; hard to reuse |
| Fail-closed Phase 1 on every doubt | Quiet risk theater | Weak model becomes a silent veto |
| Confidence floor discards all typed answers | Never being loudly wrong | Unknown forever; bot looks alive while empty |
| **Advisory typed surface + fail-open + keep shapes under the floor** | Helpful signal without false authority | Slightly more honesty about low confidence — worth it |

![Advisory comment, label, and feed stop before the human merge button, versus a false path where those signals land the change](/images/posts/advisory-pr-triage-advisory-vs-authority.png)

*A comment on a PR is not merge authority. The interesting arrow is the one that is missing.*

## System model

1. **Human** owns the merge button and reads advisory signal as advice.
2. **Triage bot / job** runs typed checks, writes one marker comment, sets one `triage/*` label, emits a feed note.
3. **Checks** report structured results humans can skim.
4. **Classifier Phase 1** is fail-open: unknown is first-class, not a discarded shape.
5. **Confidence floor** may *annotate* low confidence; it must not delete typed answers.
6. **Land / merge path** does **not** subscribe to the advisory comment, label, or feed note.
7. **Reusable `workflow_call`** packages the same job so other repos can call the contract without copying folklore.

The interesting arrow is the one that **is missing**: there is no edge from advisory surface → merge. If you draw that edge “temporarily,” you no longer have advisory triage. You have a soft merge button with better marketing.

## Implementation detail

You do not need my fleet names to steal the shape.

1. **Write the contract first.** What types can the classifier emit? What does unknown mean?
2. **One marker comment** per pass — findable, not spam.
3. **One label family** (`triage/*`), not overlapping “bot touched this” tags.
4. **Feed note for operators**, not for land automation.
5. **Phase 1 fail-open.** Doubt becomes unknown in public, not a hidden drop.
6. **Confidence floor as annotation, not shredder.** Keep typed answers; show low confidence beside them.
7. **Assert the missing edge.** Any job that reads this label or comment to merge gets cut.
8. **Package as `workflow_call`** so other repos call the contract instead of forking folklore.
9. **Honest public verbs.** Pattern + incident shape — not hostnames, keys, or invented triage counts.

## Failure modes

1. **Authority creep** — advisory label becomes a required check for merge. **Fix:** separate land path; document the missing edge.
2. **Unknown theater** — confidence floor discards every typed answer; bot posts unknown with a smile. **Fix:** keep shapes; show low confidence.
3. **Comment spam** — five bot voices per PR. **Fix:** one marker comment contract.
4. **Fail-closed Phase 1** — weak model vetoes by silence or block. **Fix:** fail-open unknown.
5. **Untyped vibes** — free text only; cannot test or reuse. **Fix:** typed answers as the unit of triage.
6. **Private metrics on a public post** — “N PRs triaged” without an allowlist. **Fix:** pattern + incident shape only.
7. **Reusable job that secretly owns merge** — `workflow_call` that lands when a label appears. **Fix:** call sites get triage only; land stays elsewhere.

## Put it into practice

1. Sketch the public surface on one page: checks, one comment, one label, feed note — and explicitly “no land consumer.”
2. Add a planted case where the classifier emits a typed answer under the confidence floor; assert the shape still appears.
3. Review workflows for any job that reads `triage/*` or the marker comment to merge; delete that edge.
4. Publish the job as `workflow_call` with a typed contract a stranger could follow.
5. Teach one sentence upstairs: **the bot advises; humans merge.**

## Next in the system

This Pattern sits beside — and does not rewrite — essays on **human approval as the merge button** and **prove-before-floor** gate honesty. Those own “who may ship” and “when green is theater.” This one owns a thinner claim: **triage in public without becoming the ship button, and never let a confidence floor eat typed answers.**

Steal the rule even if your stack differs: advisory signals, typed contracts, fail-open early, keep the shapes you already paid for.
