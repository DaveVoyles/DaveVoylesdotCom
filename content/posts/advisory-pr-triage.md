+++
date = '2026-11-08T08:00:00-05:00'
draft = false
title = 'My triage bot was busy and said nothing'
author = 'Dave Voyles'
description = 'My triage bot commented and labeled every PR while a confidence cutoff threw away all of its answers, so the result always read unknown.'
categories = ['Programming', 'AI']
tags = ['Pattern', 'PR triage', 'advisory', 'fail-open', 'CI', 'agents', 'confidence floor']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/advisory-pr-triage-cover.png"
alt = "Advisory triage stops before the ship button. A pull request moves through typed checks, a comment and a label, then stops; the merge button is human only. Below a confidence floor, a shredder discards the typed answer, while an annotation keeps the typed answer with a low-confidence badge."
caption = "Advisory triage stops before the ship button; a confidence floor that eats every typed answer is worse than a quiet bot."
+++

The first time my triage bot ran for real, it did everything except the triage. It left its comment. It set its label. The checks looked calm enough that nobody panicked. Behind that, every typed answer the classifier had produced (a classifier output with a declared form, such as a named type or a score band, as opposed to free text) had been thrown away by a confidence cutoff borrowed from another classifier, so the public result read **unknown**.

The bot was busy and the triage was empty. That is worse than a loud red check. People read “the bot reviewed it” and trusted it.

The rule I took from it has two halves. Triage is advice, so nothing that can dispatch a job or merge a change may read it. And when a confidence floor shows up, it may mark an answer as shaky but it may not delete an answer that already has a type and a score. Staying silent about an answer you already have is a bug, whatever it looks like.

You can get this wrong in two ways. One is a comment that feels like a ship decision. The other is a bot that posts unknown forever while everyone points at the activity as proof it works. Either way, people stop reading the bot.

![Typed answers discarded under a confidence floor until the public result is unknown, versus the fix that keeps the typed answer and badges low confidence](/images/posts/advisory-pr-triage-confidence-floor.png)

*A floor that eats every typed answer leaves a busy bot and an empty triage. The fix keeps the typed answer and badges it low confidence.*

## What the bot is allowed to do

I extend and operate agent and CI paths where bots help humans triage pull requests in public. A pull request is a proposed change waiting for review before it joins the main branch, and merging it is the ship button.

So the advisory path is thin on purpose. It has typed checks and a short feed note, plus one marker comment and one `triage/*` label. That is the whole public surface, and nothing in dispatch or land reads those signals to merge. The bot may help in the thread. It must not become the merge button by accident.

The classifier is fail-open in Phase 1. When it does not know, it says so and carries on without pretending it decided. A weak model should never turn into a silent veto.

The floor was the surprise. The cutoff sat under the typed outputs, and every structured slot and every score fell below the line and vanished. I did not “raise the floor until it feels safer.” I stopped discarding typed answers under it: keep the typed answer and show the low confidence. People can argue with a weak guess. They cannot argue with an empty result that arrived looking like a review.

## Why a quiet bot is easy to miss

“The bot triaged the PR” sounds like more hands on the work. What actually happened may be only that a comment and a label appeared, which is narrower and sometimes emptier.

A reusable Actions job makes it cheap to put a bot on every pull request, and a bot that cheap tends to drift one of two ways. One is authority creep, where someone wires the advisory label into a land job “just for now.” The other is confident silence, where a floor eats every typed answer so the bot never risks being wrong and never helps either. Meanwhile the dashboards look healthy and humans still do all the triage.

## The choice I made

I prefer advisory-only triage with a typed public surface, a fail-open Phase 1 classifier, and a hard rule that typed answers survive a confidence floor. Merge authority stays human, or sits on a separate land path with a named owner. I also offer the triage job as a reusable `workflow_call` that other repos can call, with the same contract and no private wiring needed to copy it.

| Approach | What it optimizes | What breaks |
| :--- | :--- | :--- |
| Bot comment that also gates merge | "One system" | Comment becomes ship authority by accident |
| Untyped free-text triage only | Fast demos | No contract; hard to test; hard to reuse |
| Fail-closed Phase 1 on every doubt | Looks careful | Weak model becomes a silent veto |
| Confidence floor discards all typed answers | Never being loudly wrong | Unknown forever; bot looks alive while empty |
| Advisory typed surface, fail-open, typed answers kept under the floor | Helpful signal without false authority | Slightly more honesty about low confidence, which is worth it |

![Advisory comment, label, and feed stop before the human merge button, versus a false path where those signals land the change](/images/posts/advisory-pr-triage-advisory-vs-authority.png)

*A comment on a PR is not merge authority. Look for the arrow that is missing.*

## The arrow that is missing

A human owns the merge button and reads the advisory signal as advice. The triage job runs the checks, writes its comment, sets its label and emits the note. The Phase 1 classifier is fail-open, so unknown is a first-class answer and not a discarded answer. The confidence floor may annotate low confidence, but it must not delete typed answers. The land path does not subscribe to any of the three. And the `workflow_call` packages the same job, so other repos get the contract without copying my habits.

Look at the diagram for the one edge that is absent. Nothing runs from the advisory surface to the merge. If you draw that edge "temporarily," you no longer have advisory triage. You have a soft merge button.

## Building it yourself

Start with the contract. Decide which types the classifier can emit and what unknown means. Then keep the surface small: one marker comment per pass that people can find, and one label family (`triage/*`) instead of overlapping "bot touched this" tags. The feed note is for operators, never for land automation.

In Phase 1, doubt becomes unknown in public and not a hidden drop. Treat the confidence floor as an annotation. Keep the typed answer and show the low confidence beside it. Then assert the missing edge: any job that reads the label or the comment to merge gets cut. Finally, package it as a `workflow_call` so other repos call the contract instead of forking it.

## Six ways this goes wrong

1. **Authority creep.** The advisory label becomes a required check for merge. Keep a separate land path and document the missing edge.
2. **Unknown forever.** The floor discards every typed answer and the bot cheerfully posts unknown. Keep the typed answers and show low confidence.
3. **Comment spam.** Five bot voices on one PR. Hold to the one marker comment contract.
4. **Fail-closed Phase 1.** A weak model vetoes by silence or block. Fail open to unknown instead.
5. **Untyped vibes.** Free text only, so nothing can be tested or reused. Make typed answers the unit of triage.
6. **A reusable job that secretly owns merge.** A `workflow_call` that lands when a label appears. Give call sites triage only and keep land elsewhere.

## Try it this week

Sketch the public surface on one page and write "no land consumer" on it. Add a planted case where the classifier emits a typed answer under the confidence floor, and assert the typed answer still appears. Search your workflows for any job that reads `triage/*` or the marker comment to merge, and delete that edge. If you want other repos to use it, publish the job as a `workflow_call` with a typed contract a stranger could follow.

Then teach one sentence upstairs: the bot advises, humans merge.

## What the neighbors cover

This post sits beside, and does not rewrite, two others: **[human approval as the merge button](/posts/human-approval-merge-button/)** and **[prove-before-floor](/posts/prove-hook-before-floor/)**. Those own “who may ship” and “when green is theater.” This one owns a thinner claim: triage in public without becoming the ship button, and never letting a confidence floor eat typed answers.
