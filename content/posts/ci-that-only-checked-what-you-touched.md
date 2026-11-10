+++
date = "2026-12-03T08:00:00-05:00"
draft = false
title = 'The CI that only checked what I touched'
author = 'Dave Voyles'
description = 'Our pull request checks only ran the tests a change looked like it touched. A stale map of which test depends on which file let a real break through, and nobody saw it until the default branch went red and every push to that project stopped.'
categories = ['Programming', 'AI']
tags = ['Pattern', 'CI', 'testing', 'automation', 'AI agents']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/ci-that-only-checked-what-you-touched-cover.png"
social = '/images/posts/ci-that-only-checked-what-you-touched-cover-social.png'
mobile = '/images/posts/ci-that-only-checked-what-you-touched-cover-portrait.png'
alt = 'A changed file goes into a test map. One entry is missing a file, so its dashed arrow never reaches the step it should select. The pull request check runs only the selected steps and ends Green, with that step skipped. The full run on the default branch runs every step, and that same step fails, ending Red.'
caption = 'The pull request check was honest about what it ran. It just did not know about everything the change could break.'
+++

A change merged cleanly, the next full run on the default branch went red, and because our push tool refuses new pushes while the default branch is red, no agent working on that project could push until someone fixed it.

Running only the tests a change touches is one of those ideas that sounds obviously right. If I edit a file in one corner of a project, why should I wait for every test in every other corner to finish before I find out whether my change is fine? On a busy project with a lot of automated contributors, that difference adds up fast, and it's why I set up our pull request checks that way.

The catch is that "the tests this change touches" is a guess. Somebody, or something, has to decide which tests care about which files, and that decision lives in a map that can go stale. When it does, the pull request check stays green for a change that is actually broken, because the one test that would have caught it never ran.

**We fixed it by repairing the map and making the failing test name itself. When the fast check and the full run on the default branch disagree, the full run is the one I believe.**

{{< motion-figure gif="/images/posts/ci-that-only-checked-what-you-touched-fig1-stale-map-skipped-the-step.gif" still="/images/posts/ci-that-only-checked-what-you-touched-fig1-stale-map-skipped-the-step-final.png" width="1280" height="2780" alt="A changed file is looked up in the test map. Two steps that list it are selected and run; the step whose entry does not list it is not selected and skipped. After the merge, the full run on the default branch runs every step, the skipped step goes red, and pushes to this project pause." >}}

## The five-line version

- Our pull request checks run only the test steps a change appears to affect. A map decides which steps those are.
- One change made a test depend on two new library files, but that test's entry in the map was never updated, so pull request checks never picked it.
- The full run on the default branch, which runs everything, caught the break after merge. That turned the default branch red and paused every push to that project.
- The first guess was a flaky test. The evidence pointed to a real gap in the map, so we regenerated the map instead of rerunning the test until it passed.
- Two other problems turned up in the same red run, and we fixed each one separately rather than blaming them all on bad luck.

## A few words first

Before I walk through what broke, here are the terms I'll lean on, in plain words:

- **CI**, short for continuous integration, is the set of automatic checks that runs every time someone proposes a change. If the checks pass, the change is green. If any fail, it's red.
- A **pull request** is a proposed change waiting for review and checks before it merges into the main line of the project.
- The **default branch** is that main line. In most projects it's called `main`, and it's where finished work lands.
- A **test step** is one named group of tests that CI can run on its own.
- The **step map** is a list that says, for each test step, which files it depends on. When a pull request changes a file, CI looks at the map and runs only the steps that list that file.

GitHub has a built-in version of this idea for whole workflows. You can tell a workflow to run only when certain [file paths change](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), and if no matching file changed, it doesn't run. Ours works at a finer grain, one test step at a time, but the trade is the same. You get speed, and in return you are trusting a list to know what depends on what.

## What actually happened

I'll go through the sequence slowly, because the order matters.

First, a reviewed change added two new library files and wired them into the code that one of our test steps exercises. Nothing about that was wrong. The new code worked. But the test step's entry in the step map still listed only the files it had depended on before. The map didn't know that this step now also cared about those two new files.

Second, CI on that pull request looked at which files changed, checked the map, and picked the steps that listed those files. The step that now depended on them wasn't on the list, so it didn't run. Every step that did run passed. The pull request was green, it was reviewed, and it merged.

Third, the default branch doesn't use the shortcut. When a change lands there, CI runs the full set of steps, every one of them, whatever the map says. That full run executed the step the pull request had skipped, and that step failed. The default branch went red.

Fourth, and this is where it stopped being a small problem: our push tool refuses to push to a project whose default branch is red. That rule exists for a good reason, because piling new changes on top of a broken base makes the break harder to find. But it also means one hidden gap in a map can stop every agent working on that project until someone fixes it.

| | Pull request check | Full run on the default branch |
|---|---|---|
| Which steps run | Only the steps the map links to the changed files | Every step |
| Saw the broken step? | No, the map didn't link it to the new files | Yes |
| Result | Green | Red, and pushes to that project paused |

## Why "flaky" was the wrong first guess

When a test passes on the pull request and fails right after merge, the tempting explanation is that the test is flaky, meaning it sometimes fails for no real reason. That guess was on the table here too. It was an easy guess here, partly because we had real timing trouble at the same moment, which I'll get to.

The trouble with "flaky" is that it points you toward a retry. Run it again, and if it passes, move on. In this case a retry would have made things worse, because the pull request check would keep skipping the step and the full run would keep failing it, so the cycle would repeat with every change that touched those files.

What settled it was looking at why the step hadn't run on the pull request at all. The change had added files to the step's import chain, the set of files it loads when it runs, and the map hadn't been updated to match. Because the step loads those files every time it runs, the map has to list them too. If it doesn't, a change to one of them never tells the fast path to pick that step. Nothing random about it. The list was out of date.

## What we changed

The fix had a few parts, so here is which part did what.

The map entry for that step was regenerated with the same tool that builds the step map from the code, instead of being edited by hand. That's the actual repair. The pull request check will now pick that step when those library files change.

{{< motion-figure gif="/images/posts/ci-that-only-checked-what-you-touched-fig2-map-entry-before-after.gif" still="/images/posts/ci-that-only-checked-what-you-touched-fig2-map-entry-before-after-final.png" width="1280" height="2000" alt="The map entry for one step, before and after. Before, the entry lists only its old files, so the changed file is not matched and the step is skipped. After, the entry also lists the two new files the step loads, and the same change now selects the step." >}}

We also changed how a failing self-test reports itself. Before, the CI summary said a step had failed but made you dig to find which case inside it broke. Now the failing case prints its own name on a line that CI turns into a visible annotation. The next time something like this happens, the red run tells you where to look instead of making you go hunting.

## The other two problems in the same red run

A red run is a bad time to assume there's only one cause. This one had three, and only one of them was the map.

The second was a check that watches for leftover background processes after tests finish. It took one snapshot, caught a process that was still in the middle of shutting down, and called it a leak. We couldn't reproduce that on a quiet machine, so I can't tell you exactly which process it was. The change makes the check take its snapshot a few times over a short window and report only processes that are still there every time. A process we deliberately leave running in its own test still fails the check, so it didn't get looser about real leaks.

The third was a set of tests that assert how long something takes. On a machine that was very busy running a lot of agent sessions at once, those timings slipped past their limits. We didn't change the limits. Those tests now run on their own instead of alongside other steps, and the change says plainly that the underlying load wasn't fixed, so wall-clock tests may still wobble until it drops.

There was also a queueing problem, where the full run on the default branch could wait a long time for a free slot because it shared one with agents. That run now starts in slots the agents don't fill first.

| Problem | First guess | What it turned out to be | What changed |
|---|---|---|---|
| Self-test step failed after merge | Flaky test | A stale map entry | Regenerated the entry; the failing case names itself |
| Leftover-process check failed | Real leak | A process caught mid-shutdown | Sample a few times; report only what stays |
| Timing tests failed | Slow code | A very busy machine | Run them on their own; limits unchanged |

## Habits I would keep

If your CI only runs what a change touches, these are the habits I'd keep.

Treat the map as code. If a tool can generate it from what each test actually loads, let the tool generate it, and regenerate it when imports change. A map someone edits by hand will drift, quietly, and the drift only shows up later.

Keep a full run somewhere it can't be skipped. For us that's the default branch. It's the check that catches what the fast path missed, so when it disagrees with a green pull request, believe the full run first and figure out why the fast path didn't see it.

Make failures say where they are. A red step with a vague message invites the "probably flaky" guess. A red step that prints the name of the broken case invites a fix.

And when one run goes red for several reasons at once, split them up. Each one gets its own cause, its own fix, and its own honest note about what's still open.

## Why I still run the fast check

I still like running only what a change touches. It saves a lot of waiting, and most of the time the map is right. What I don't do anymore is read a green pull request check as proof that nothing else broke. It's proof that the steps it chose passed. Whether it chose the right steps depends on a map, and the map deserves the same care as any other code that decides what gets tested.
