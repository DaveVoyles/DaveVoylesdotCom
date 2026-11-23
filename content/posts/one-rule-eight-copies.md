+++
draft = true
title = 'My merge tools had eight copies of one rule, and they disagreed eleven ways'
author = 'Dave Voyles'
description = "Every tool that could merge a pull request in my agent setup had its own idea of whose review counted. I replaced the copies with one small command that answers the question, then watched real pull requests find four more holes in it the same day."
categories = ['Programming', 'AI']
tags = ['automation', 'ops', 'code review', 'Build log']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/one-rule-eight-copies-cover.png"
alt = "Eight rubber-stamp marks on one sheet of paper, meant to match, each slightly different."
caption = "Same question, eight answers."
+++

Has somebody I trust approved this pull request? That question should take one line of code to answer. For a while the honest answer in my agent setup was "it depends which tool you ask," and when I finally sat down and counted, the rule for whose review counts had been copied into eight different files, and the eight copies disagreed with each other in eleven places.

My agents open pull requests all day, and a separate reviewer bot reads them and leaves a verdict, either SHIP (merge it) or BLOCK (don't). Four tools act on that verdict. I run a merge helper by hand; a merge bot lands things on its own; an audit flags merges that look wrong after the fact; and a tool starts a review automatically when a sensitive change opens. Each one needed to know whether a SHIP counted, so each had grown its own small parser for reading review comments and deciding. Nobody planned that. It happened one helpful pull request at a time, which is how most of my messes happen.

If several tools have to agree on a yes, they need one place to ask, and that place has to say "I'm not sure" out loud instead of guessing.

{{< motion-figure gif="/images/posts/one-rule-eight-copies-fig1.webp" still="/images/posts/one-rule-eight-copies-fig1-final.png" width="1440" height="700" alt="Four tools on the left, each with its own small parser reading the same pull request on the right and showing a different answer: yes, no, yes, and a question mark. The parsers give way to one decide box in the middle, and all four now show counted=yes." >}}

*Four parsers, four answers. One decider, one answer, and every tool asks it the same question.*

## What eleven disagreements look like

Most of the disagreements were small, the kind you'd never notice reading any one file. The tool that starts reviews, for example, still told people that "SHIP WITH NITS" counted as an approval, at a time when the written rule said it didn't. The one that got my attention sat in the required check itself, the status GitHub looks at before it lets anything merge. That check read BLOCK verdicts from comments, but it missed a BLOCK the reviewer had posted as the body of a formal review. A pull request could be blocked in plain sight and the gate would never see it.

The other cost was slower and more boring. When I wanted to change who could approve what, the last round of that work took seven pull requests across three repositories, because every copy had to move together. Seven chances to get one of them slightly wrong, and getting one slightly wrong was the whole problem.

## One command that answers one question

The fix was to stop letting tools read review comments at all. A single read-only command, the decider, now takes a repository, a pull request number and the commit the caller cares about, reads the reviews and comments itself, and prints exactly one line:

```
reviewer-ship-decision counted=yes|no by=bot|<agent>|none session=ID|- comment=URL|- head=40-hex docs_only=yes|no
```

Every tool that merges, audits or starts a review asks the decider and parses that line. Only `counted=yes` means approved, and the exit code alone is never treated as an approval. The rule itself lives in one plain-language document with eleven numbered rulings, and the test suite refuses to pass if a ruling has no test case proving it.

The part I care about most is what happens when the decider can't tell. It exits with its own "unsure" code, it prints `counted=unsure` with a reason, and it never prints `counted=yes` in that state. An API error, an answer it can't parse, a missing setting or a commit id that isn't the full forty characters all land on unsure, and every caller treats unsure as no. That's fail closed: when something breaks, the cost is a pull request that waits for a person, not one that merges without a review.

![A four-row decision table. SHIP at this commit prints counted=yes and merges. BLOCK at this commit prints counted=no and refuses. An API error and a commit that moved while judging both print counted=unsure and refuse, waiting for a person.](/images/posts/one-rule-eight-copies-fig2.png)

*Only the first row ends in a merge.*

## The four holes review found in the first cut

The first version of the decider merged on a Saturday morning, and a second reviewing agent and the reviewer bot, reading it more carefully than I had, found four holes.

1. Edited comments. An audit can ask "did this merge have a counted review at the moment it merged?" The first cut ignored comments posted after that time, but it didn't notice a comment that had been edited afterward to look harmless. Now any comment edited after the time in question makes the answer unsure.
2. Docs-only changes. A change that touches only documentation passes the required check without a review. The first cut reported that as `counted=yes`, which meant any tool that checked only that field would treat an unreviewed pull request as reviewed. Now a docs-only pass prints `counted=no` with a separate docs-only flag, and the status writer reads the flag itself.
3. Dismissed reviews. A SHIP inside a review that someone had dismissed still counted. Now it doesn't, while a dismissed BLOCK still stands, because dismissing a "no" shouldn't quietly turn it into a "yes."
4. A moving commit. If someone pushed a new commit while the decider was judging, it didn't notice and answered about a commit that was no longer the one being merged. Now that's unsure too.

The follow-up landed about an hour and a half after the first one, with the test count going from 133 to 137. None of these are parser bugs in the usual sense. Each one is a case where the code answered a slightly different question than the one being asked: approved at some point, rather than approved at this commit, as it stood, by a review that's still in force.

![A pull request timeline. A counted SHIP lands at commit A. Four events follow in order: the comment is edited, the change turns out to be docs-only, the review is dismissed, and a new commit B is pushed. Each one turns the answer to unsure, no, no and unsure.](/images/posts/one-rule-eight-copies-fig3.png)

*Approved at this commit, as it stood, by a review that's still in force. Each event breaks one of those three.*

## Then real pull requests found four more

Unit tests only prove that the decider gives the answers I expected for the cases I thought of. So that afternoon I ran throwaway pull requests through the real merge path, end to end, and cleaned each one up afterward. That turned up four more problems.

5. A path that wasn't what it looked like. On macOS, a temporary folder under `/var` is really a link to `/private/var`. The decider checks whether it's being run directly by comparing paths, and it compared the unresolved one, so it quietly printed nothing at all. Every caller treats no answer as no, so every merge was refused. That was annoying, but it's exactly the failure I'd signed up for: the system stopped instead of guessing.
6. A cancelled run that looked like a failure. When a gate run was cancelled, the decider read it as a failed one. My first fix for that didn't work on real pull requests, so it took a second change to get it right.
7. Two names for one bot. One of the tools looked for the reviewer bot under a different login name than the others did. Now they all use the same login.
8. A real approval on a docs-only change. This is the mirror image of hole 2. A docs-only change that nobody reviewed should print `counted=no`, but when the reviewer really did approve a docs-only pull request, the decider dropped that approval too. A real SHIP should count no matter which files the change touches.

## Keeping it at one copy

The last piece is the one that keeps the work from leaking away. A new check fails any pull request that adds verdict-parsing code outside the decider, and the standards my agents read now point at the rule document instead of restating the rule in their own words. I didn't trust myself, or my agents, to remember not to write a ninth copy, so the build remembers for us.

If you have more than one tool deciding whether something is allowed to ship, it's worth counting how many copies of that rule you have, because the number is probably bigger than you think and the copies have probably drifted. The rule ends up in one place that every tool asks, "unsure" becomes its own answer that always means no, and then real pull requests try to break it, because mine found holes my tests never would have.
