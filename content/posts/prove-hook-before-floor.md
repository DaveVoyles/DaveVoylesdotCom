+++
title = "Prove the guard before it becomes the floor"
date = "2026-09-10T13:40:00-04:00"
draft = true
author = "Dave Voyles"
description = "A policy slide is not a control. Before you trust the guard that sits in front of an AI agent, make it prove it works — or leave the last good one in place."
categories = ["Programming", "AI"]
tags = ["AI agents", "evals", "security", "ops", "TPM"]
topics = ["Tech"]
[cover]
image = "/images/posts/prove-hook-before-floor-sticky-vs-lock.jpg"
alt = "Crumpled sticky note beside a real keyed lock on a steel panel"
caption = "A sticky note is not a control. The lock is."
+++

Agents are fluent. Fluency is not the same as **safe**.

If you are rolling AI agents into a real org, you already know the demo version of this problem. The model sounds careful. The slide says "guardrails." Someone writes "do not touch production" in a prompt, and the room relaxes. That sentence is a sticky note. It is not a control. When the agent is in a hurry, or the chat got cut short, or it found a clever way to spell the same dangerous action, the sticky note is already gone.

I am a **former** Senior Technical Program Manager at Xbox / Microsoft. **10+** years of that job trained a boring habit: the control that earns its keep is the one that can fail a check out loud, not the one that sounds confident in a meeting. Agent fleets inherit the same failure mode with better vocabulary. So the rule I keep coming back to is simple enough to steal into a staff meeting:

**Prove the guard before it becomes the floor.**

The "floor" is just the copy of the rule that actually runs everywhere agents work — not the draft in a design doc, not the version someone meant to roll out next sprint. If you promote a guard to that floor without proving it works, you did not ship safety. You shipped decoration that fails the first time something real goes wrong.

## Picture this

You are adopting agents the way a sane org adopts any junior with infinite energy and imperfect judgment. You do not hand them production because the resume sounded sharp. You put a check in front of the dangerous moves, and you make that check prove itself before it is the standard.

In my setup I extend and operate a harness that does that for AI tool use: before an agent can delete, write outside a scratch folder, or run a command that matters, a small guard gets a vote. The details are engineering. The management question is the same one I used to ask on Xbox pipelines:

> Did this control pass an independent check, or did we install it because it looked present?

## Sticky notes do not stop an agent

![Crumpled sticky policy note beside a real lock that still requires a key](/images/posts/prove-hook-before-floor-locked-hatch.jpg "Policy text is not the guard — the thing that can say no is")

Every agent rollout writes some version of:

> Be careful with deletes. Do not touch production. Remember the scratch folder.

That is policy theater with better typography. A design doc that only lives in Confluence is the same failure mode. You need a real check that runs when the agent acts — and then you need a second, harder habit: the check itself has to earn the job.

Code that *looks* installed can still be hollow. It can be missing a piece, matching the wrong folder, or treating a sentence *about* a dangerous command as if the command itself were running. The floor has to earn its place the same way a merge gate does: **independent proof, not self-confidence.** Same muscle as [eval gates that are not theater](/posts/eval-gates-not-theater/).

## Prove it before you trust it everywhere

We used to be too trusting on install. A session could pull the latest guards and drop them onto every machine with no proof that the new copy actually worked. A file that was present, readable, and quietly broken would install cleanly. Then every other check that depended on it would fail open, machine-wide — which is a polite way of saying the org thought it had a control and did not.

The fix is the one you want in a factory, not a demo. Before anything becomes the new standard, stage it and **run a self-test the guard cannot fake**. Fail or time out, and the whole install is refused. The previous good floor stays put. Green means the check ran and passed. "Looks fine in the repo" is not green. The install script does not get to waive the check by sounding sure — same shape as a real [eval](/about/?node=eval) gate.

That is the executive takeaway in one line: **do not replace a working control with an unproven one.**

## When one check goes red, keep the other receipts

Checks run as a set. One of them going red used to wipe the genuine results from the ones that already passed, so you lost the signal you needed and spent the next hour re-running work that had already told the truth.

That is theater with a red light instead of a green one. A red check should **stop the pipeline** and **preserve the receipts** from every other check that finished honestly. Fail-closed on the decision. Fail-honest on the evidence. Missing proof is not a pass, and a single failure is not permission to throw away everything you already learned.

If you have ever sat in a status meeting where one bad slide made the room forget three green workstreams, you already understand this. Agents just make the wipe faster.

## Talking about risk is not the same as taking it

Early guards matched on the *words* of a command. A pattern match cannot tell a live recursive delete from a runbook that names one. So filing an incident note, writing a warning, or quoting the bad command in a memory all got blocked by the same control that was supposed to stop the real delete.

Agents, being agents, found a workaround: split the dangerous text into pieces so the matcher would not see it. That teaches the exact reflex these guards exist to prevent. The fix was to ignore inert explanation text and still block the live action — so **talking about** a dangerous move is allowed and **running** one is not.

For an exec audience, the translation is: your safety system has to understand intent well enough that documentation does not get treated as an attack, or people will route around it, and then you have neither safety nor a paper trail.

## "Looks like the safe folder" is not the safe folder

Scratch space is the temporary area an agent is allowed to trash. Real work lives elsewhere. We used to check that with a lazy text match. A path that *started* like temp could still walk somewhere else in the middle. Separately, a missing shared library used to take the whole machine down — every harmless command included — because the system failed closed on *existence* instead of on the dangerous operations it was meant to protect. You could not fix it from inside a session. A human had to unblock the box by hand.

Two corrections, same theme. First, resolve the path for real before you decide "scratch" versus "production work." Second, a missing piece should block the dangerous classes it exists to guard, not every keystroke on the machine. And once you trust a shared library, do not only check that the file is readable. **Prove it works** with a known input. A present-but-broken pass-through will sail past a readability check and then lie about every path that matters.

When one guard never grew a self-test, installs froze for weeks — correctly, because "could not prove it" counts as failed. The gate was doing its job. The guard simply had nothing to answer with. Adding a real self-test unfroze the floor without weakening the rule.

## Theater vs. a floor that proves itself

| Theater | Floor that proves itself |
|--------|---------------------------|
| File is present, so we trust it | Self-test runs before it becomes the standard |
| One red check wipes every other result | Red stops the run; other checks keep their real receipts |
| Policy matches the words in a runbook | Match the live action, not the sentence about it |
| Path *looks* like the safe folder | Path is resolved for real; shortcuts cannot walk past |
| Missing piece blocks everything | Missing piece blocks only the dangerous classes |
| "Looks fine to me" in the same meeting | Independent proof the agent cannot waive |

If your safety never fails an install, you do not have safety — you have decoration that has not been asked a hard question yet.

## What to steal for an AI adoption program

You do not need my harness to use the rule. You need three habits:

1. **Separate the sticky note from the control.** Prompts and slides are communication. The control is the thing that can say no when the agent acts.
2. **Prove before you promote.** A new guard does not replace a working one until an independent check passes. If the check is missing, that is a fail, not a maybe.
3. **Keep receipts when something goes red.** One failure stops the line. It does not erase the honest results you already have.

[Human approval](/posts/human-approval-merge-button/) is still the last click when the automated proof is amber or red. The [landing floor](/posts/landing-floor-without-a-github-app/) is how work actually becomes trusted. The guards are just the keyboard-close version of the same program discipline.

On the constellation: [Eval gates](/about/?node=eval) and [Human approval](/about/?node=human).

**Bottom line:** a guard that never had to prove itself is just a sticky note with better branding. **Prove it before it becomes the floor** — and when one check goes red, keep the receipts from the ones that already told the truth.
