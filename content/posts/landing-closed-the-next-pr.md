+++
draft = true
title = 'Landing one pull request closed the next'
author = 'Dave Voyles'
description = "A merge succeeded, but the next pull request in the stack closed during branch cleanup. Here is what happened, why we now move dependent pull requests before merging, and the status-print caveat we kept separate from that fix."
categories = ['Programming', 'AI']
tags = ['Pattern', 'pull requests', 'git', 'automation', 'AI agents']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/landing-closed-the-next-pr-cover-direction-2.gif'
still = '/images/posts/landing-closed-the-next-pr-cover-direction-2-final.png'
social = '/images/posts/landing-closed-the-next-pr-cover-direction-2-social.png'
mobile = '/images/posts/landing-closed-the-next-pr-cover-direction-2-portrait.gif'
mobile_still = '/images/posts/landing-closed-the-next-pr-cover-direction-2-portrait-final.png'
alt = "Time chart of our observed incident with three lanes: the default branch, an earlier change, and a dependent pull request based on it. First the earlier change merges, then its branch ends, then the dependent pull request closes. Its commit marks are still drawn. Closing the pull request does not by itself show that Git erased its commits."
caption = "In our run, the earlier change merged and its branch was deleted, and then the dependent pull request closed. GitHub documents automatic retargeting in this situation, so this shows our observed incident, not the general rule."
+++

I like small pull requests because I can follow what changed without having to keep the whole project in my head. They're easier to review and easier to revert. When an agent is doing the implementation, a small change also gives me a more manageable piece of work to check before it goes onto the default branch.

Some changes depend on work that hasn't merged yet. I can still review them separately by stacking their pull requests, with each branch based on the one before it. That introduces a responsibility for the tool that lands them: merging one change shouldn't interrupt review of the change that comes next.

We ran into exactly that problem. A reviewed change merged, the landing tool deleted its branch as cleanup, and the next pull request in the stack closed. A real change had to be rebuilt. The merge had succeeded, but that wasn't enough to tell us whether the rest of the stack was still ready for review.

**Our fix was to check mergeability, move dependent pull requests onto the default branch before merging, and refuse to merge if that move failed. That makes preserving the next pull request an explicit part of landing the current one, rather than leaving it to branch cleanup.**

![The observed path merges A, removes its head, and closes B. The revised path checks mergeability, retargets B to the default branch before merging, then merges and deletes A's head while B remains open.](/images/posts/landing-closed-the-next-pr-d1-incident-vs-revised-final.png)

*A and B illustrate the dependency. The left path shows what happened in our incident, not a universal GitHub rule. The revised land step retargets dependents before merging and refuses to merge if a retarget fails.*

## In brief

- A stacked pull request is based on another feature branch while that earlier change is still pending.
- In our incident, deleting the merged branch closed the pull request based on it. GitHub documents automatic retargeting in this situation, so our observation shouldn't be treated as the general rule.
- Our land step now checks mergeability, retargets open dependents, then merges and deletes the head. A failed retarget stops the merge.
- At the time this change was reviewed, an imperfect post-merge status print remained a separate caveat. I'm not claiming that print was fixed by this work.

## Words I use

I'll walk through the branch relationships below, but these are the terms I use throughout the post:

- A **pull request** is a proposed change submitted for review and merging.
- The **default branch** is the main line of the repository, often called `main`, where finished work lands.
- A pull request's **base branch** is the branch it proposes to merge into. Its **head branch** contains the proposed work.
- **Stacked pull requests** form a chain in which a later change is based on an earlier change's branch, rather than directly on the default branch.
- **Land** means merge a reviewed pull request and clean up its branch. Here, agents run a small tool to do that work.
- **Mergeable** is GitHub's flag for whether the pull request can merge cleanly into its base. It doesn't replace review or the other checks.
- **Retarget** means change a pull request's base. In this fix, the land step changes dependent pull requests to use the default branch.

## The quiet way to lose a change

Here's a hypothetical example to make the dependency easier to follow. Suppose the first change adds a field to an API response, and the second displays that field on a page. I'll call their pull requests A and B. These aren't the actual changes from the incident; they're just a way to explain the branch relationships.

A proposes to merge into the default branch, which we'll call `main`. A pull request's base is the branch it proposes to merge into, so A's base is `main`. While A is waiting for review, its new field isn't on `main` yet. To work on the page without waiting, the author starts B's branch from A's branch. B then has the API change it needs, and its pull request uses A's branch as its base. That lets the reviewer look at the page change separately from the API change underneath it.

Now A gets reviewed and approved. The land step merges A into `main`, then deletes A's head branch as cleanup. At this point, the API field is on `main`, so B can continue toward review and merging with `main` as its new base. Changing that base is what I mean by retargeting.

GitHub's docs say it automatically retargets open pull requests when their base is a merged head branch that gets deleted. Our actual incident differed: after the earlier change merged and its branch was deleted, the dependent pull request closed instead of remaining open for review. I didn't establish why that happened, so I can't explain the gap between the documented behavior and our run.

Closing B didn't by itself mean that Git had erased its commits. I don't know exactly how much of the work could have been recovered. What I do know is that a real change had to be rebuilt, even though the earlier merge appeared to have gone as planned.

The merge log could look successful because the earlier change really had merged. That result alone didn't tell us that the dependent pull request had closed. To avoid relying on cleanup to preserve it, our automation now finds and retargets dependents before the merge. If a retarget fails, it stops rather than merging and deleting the branch anyway.

## Why stacks are worth protecting

I use stacks because I want to review related work in pieces without making the later piece wait for every earlier review to finish. In the example above, the API field and the page that uses it belong together, but they still raise different review questions. Keeping them in separate pull requests gives each change a clearer scope.

Agents can help maintain several small pull requests and land them after review. That is useful only if the landing process accounts for their dependencies. Otherwise, the author has to watch each merge and manually check whether the next pull request is still open and aimed at the right branch. I'd rather put that responsibility in the same tool that's about to remove the branch.

This is the comparison I want a reviewer of the automation to be able to follow:

| Part of landing | Earlier behavior | Revised behavior |
|-----------------|------------------|------------------|
| Mergeability | Discover a merge problem during the merge attempt | Ask GitHub before proceeding |
| Conflict or undecided state | Fail late in the merge attempt | Stop with a distinct exit on conflict or if the state is still UNKNOWN after a short retry, with a hint to update from the default branch |
| Dependent pull requests | Rely on cleanup after merging | Retarget open dependents before merging; refuse to merge if a retarget fails |
| Merge and cleanup | Merge and delete the head | Merge and delete the head only after the earlier checks and retargets succeed |
| Next pull request | Closed in our observed incident | Retargeted onto the default branch so it can remain open for review |

## The decision

I wanted the land step to answer two questions before it changed anything that the next pull request depended on. Can the current change merge cleanly? And have the open pull requests based on its branch been moved to the default branch?

The first question matters even when the automated checks are green. Those checks don't replace GitHub's assessment of whether the head can merge into its base. If GitHub reports a conflict, the land step stops and tells the operator to update from the default branch. If GitHub hasn't decided yet, the tool gives it a short retry, then stops if the answer is still UNKNOWN.

Only after that check passes does the tool retarget dependents. If any retarget fails, it refuses to merge. Once they succeed, it merges and deletes the head in one step. The order matters because checking the dependent pull requests after deleting their base would be too late to prevent the interruption we saw.

## How the pieces relate

The author or agent is responsible for preparing a change and getting it reviewed. GitHub supplies the mergeability state and stores each pull request's base. The land tool coordinates the checks, the base changes, and the eventual merge.

That makes the land tool a useful place to handle this dependency. It already knows which head branch it plans to delete and is already talking to GitHub. It can ask which open pull requests use that branch as their base before it proceeds, rather than leaving someone to discover a closed pull request afterward.

A cleanup process that runs later wouldn't give us the same protection. By then, the merge and branch deletion would already have happened. For this fix, I wanted the retarget to be a condition of proceeding with the merge, not a repair attempted afterward.

## What we changed in the land step

The implementation starts by reading GitHub's mergeable state. It retries briefly while GitHub is still deciding, but it doesn't interpret an unknown answer as permission to proceed. A conflict or an answer that stays UNKNOWN produces a distinct exit and a message pointing the operator toward updating the branch from the default branch.

Next, the land step finds open pull requests whose base is the head branch of the change being landed. It changes each of those bases to the default branch. If one of those updates fails, the tool stops and refuses to merge the current pull request. If they succeed, it proceeds with the merge and head deletion.

{{< motion-figure gif="/images/posts/landing-closed-the-next-pr-d2-merge-decision.gif" still="/images/posts/landing-closed-the-next-pr-d2-merge-decision-final.png" alt="The land step stops on conflict or if mergeability remains UNKNOWN after a short retry. A mergeable result leads to finding and retargeting dependents. Retarget failure refuses the merge; success proceeds to merge and head deletion." >}}

*UNKNOWN here is the mergeability answer before the merge, not the separate post-merge status-print caveat. Dependents must be retargeted successfully before the land step merges and deletes the head.*

Tests cover the retarget path as well. The important result to check is what happens to the dependent pull request: it should still be open and should now use the default branch as its base. A successful return from the merge alone wouldn't demonstrate that this particular problem was fixed.

## Failure modes I would not skip

The first is relying on branch deletion to take care of dependents. GitHub documents automatic retargeting, but our incident didn't follow that documented behavior, and the cause wasn't established. Explicitly moving the dependents before the merge gives our automation a step it can check and a failure it can act on.

Another is treating green checks as a substitute for mergeability. A pull request can have passing checks while still conflicting with its base. That's why the land step asks GitHub about the merge itself rather than inferring the answer from the checks.

There was also a separate logging caveat when this change was reviewed. After a merge that succeeded, the land step could still print UNKNOWN. A follow-up to re-read the pull request state before printing was still outstanding at that review. That status-print fix is separate from the retargeting work described here, and I haven't rechecked its later status for this revision.

If you see an UNKNOWN message after an apparent success, read the pull request's state on GitHub before concluding that the merge failed. The point is to distinguish an uncertain status print from the result of the merge, rather than teaching an operator or agent to treat them as the same thing.

## Put it into practice

If you're maintaining a tool that lands stacked pull requests, I'd start by reading its merge and cleanup steps together. Find where it learns whether the current pull request is mergeable, where it handles dependent pull requests, and when it deletes the head branch. Seeing those operations in order makes it easier to notice whether a check happens too late to prevent a problem.

For the approach described here, check mergeability first. Stop on a conflict or if the state remains UNKNOWN after a short retry. Then find open pull requests based on the head and retarget them to the default branch. Treat a failed retarget as a reason to stop, before merging and deleting anything.

I'd also make the dependent pull request part of the test. Check that it remains open and that its base has changed, rather than only checking that the first pull request merged. Keep the logging test separate so a reassuring status message doesn't stand in for either of those results.

## What changes

I still want small pull requests, including changes that depend on one another. What changes is what I expect the landing tool to verify before it reports success. The current change needs to merge, but the next change also needs a base it can continue to use for review.

In our case, that meant moving the dependent pull requests before the merge and refusing to proceed when that move failed. It keeps the dependency work in the tool that performs the merge, so the author doesn't have to remember a separate cleanup check every time a change lands.
