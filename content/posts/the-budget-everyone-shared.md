+++
title = "Every agent I run was spending the same 5,000 points"
date = "2026-12-23T08:00:00-05:00"
draft = false
author = "Dave Voyles"
description = "If you run more than a couple of automations against one GitHub account, they likely share one hourly budget. On the Tuesday before Thanksgiving, none of my coding agents could merge anything. The tests were fine. My GitHub account had spent its hourly GraphQL budget, and every agent was spending from it. Here is what I moved off that budget, and the rule that keeps it off."
categories = ["Programming", "AI"]
tags = ["AI agents", "GitHub", "rate limits", "automation", "Pattern"]
topics = ["Tech", "AI and Agents"]
[cover]
image = "/images/posts/the-budget-everyone-shared-cover.png"
social = "/images/posts/the-budget-everyone-shared-cover-social.png"
alt = "Rows of small agent tiles, each with a thin line running into one shared gauge that is almost empty, with a greyed-out merge button beside it, standing for every agent spending from the same budget."
caption = "Every agent was spending from it."
+++

**The short version:** my agents all share one GitHub budget, a big scan spent it, and merges stopped. What fixed it was moving the everyday work onto a different budget, and making a rate limit look like a rate limit instead of a failed build.

On Tuesday, November 24, none of my coding agents could merge a pull request. Not because the tests were red, and not because a reviewer had said no. They were stuck because my GitHub account had used up its GraphQL budget for the hour, and my agents talk to GitHub with tokens that count against my account. So when one job spent the budget, every agent was out of luck at the same time, and some of them reported it in a way that looked like broken code. That was a fun one to untangle.

If you run more than a couple of automations against one GitHub account, I think you have the same shared budget, whether or not you've noticed it yet. I'll cover what that budget is, what was spending it, the fix I wanted that didn't work, and the five changes that did.

## Two front doors, two budgets

GitHub has two main APIs, and the whole story depends on the difference, so it's worth a minute.

The REST API is the older style. You ask for one kind of thing at one address, like "the open pull requests in this repo," and you get it back. Each request counts as one request against your limit.

The GraphQL API is the newer style. You write one query that asks for exactly the fields you want, across several related things at once, like "every open pull request, plus its checks, plus its comments." That's convenient, but GitHub doesn't count it as one request. It counts points, and a query that reaches into lots of nested things costs more points than a small one.

This is the part I had skimmed past. GitHub's own docs say a user gets 5,000 GraphQL points per hour, and that this includes requests made with a personal access token and requests made by an app acting on behalf of that user. The REST API has its own primary limit, kept separately. That one is shared by the same tokens too, but it counts requests instead of points, so a simple read costs one. There are two budgets, and many of my tools were crowding into the GraphQL one.

A lot of that crowding was invisible. My reviewers and bots looped on GitHub CLI commands, and those commands were quietly spending GraphQL points. Nobody wrote "use GraphQL" anywhere, but the tools used it anyway.

{{< motion-figure gif="/images/posts/the-budget-everyone-shared-fig1-the-hour-the-pool-emptied.webp" still="/images/posts/the-budget-everyone-shared-fig1-the-hour-the-pool-emptied-final.png" width="1200" height="675" alt="A timeline of one hour. A meter labeled GraphQL budget starts at 5,000 points per hour and drains as board scan blocks fire, while two small poller drips tick steadily the whole time. At zero, the merge lane turns amber and reads waiting." >}}

*The scans did the big drain, the pollers ticked the whole time, and merge was the lane left waiting.*

## What drained it

The big spender was the project board, the GitHub Projects board where my agents and I track cards. Some jobs read the entire board in one go, every item and every field, and on November 24 those full scans drained the hour's pool.

Under that, two background jobs ran around the clock. One kept a cache of where each pull request stood, and it ran every minute, asking for check results and comments on pull requests that had already merged and that nobody was going to look at again. The other polled for open pull requests that needed review. Neither one was expensive on its own. Together, running all day and night, they were the steadiest drain on the pool.

And then there was the part that turned a slow afternoon into a confusing one. The tool that lands a pull request watched its checks over GraphQL. When the budget ran out, it couldn't read the checks, and it reported that as failing checks. So an agent reading the result would see "CI is red," and red means "go look for a bug," in code that was fine.

There was a quieter version of the same mistake on the board side. The digest that summarizes the board could fail to read it and then report an empty board, which looks exactly like a calm, healthy board. Empty and unreadable are different things, and the digest had no way to tell them apart.

## The fix I wanted, and why I couldn't have it

My first plan was to stop reading the board as me. A GitHub App's installation token gets its own budget. GitHub's docs give an installation at least 5,000 points an hour, separate from the user's pool. If the board scans ran as an App, they'd stop competing with everything else.

That plan didn't survive contact with my setup. My board is owned by my personal account, not an organization, and the App route couldn't read it. GitHub's own docs point the same way: they offer Apps a Projects permission only for organizations, and they suggest a personal token for projects owned by a user. Some people online say it can be made to work, and I didn't need to settle it that day. I needed merges to work again, so the fix became a budget gate instead.

## Five changes that did work

![Two pools side by side. GraphQL has 5,000 points an hour and REST has a separate limit. The review poller, the lander and the merge have moved to REST. Board scans stay on GraphQL behind a floor, and a CI check guards the GraphQL side.](/images/posts/the-budget-everyone-shared-fig3-two-budgets.png)

*What moved to the other budget, and what stayed behind a floor.*

**1. A floor in front of the expensive scans.** Live board scans now check how much of the GraphQL budget is left before they start, stop if it's below a floor, and log what was left. The daily digest reads a cached snapshot of the board instead of scanning it live, and if it can't read that snapshot, it exits with an error. It no longer reports an empty, healthy board when it really means "I couldn't look." That's what people mean by **fail closed**: when a tool can't tell, it says so and stops, instead of guessing the happy answer.

**2. A written rule, so the next agent doesn't undo it.** The standing instructions all my agents read moved through three small updates in one morning: read the board one page at a time, bots don't read the board at all, and reviewers and bots use REST, not GraphQL. Fixing one job helps once. Writing the rule down is what keeps the next new script from quietly going back to the old habit.

**3. The two busiest pollers went on a diet.** The pull request cache stopped asking for check results and comments on merged pull requests, and it now runs every five minutes instead of every minute. The review poller now lists open pull requests over REST, with a cache tag per repo. That tag is called an ETag. You send back the tag from your last answer, and if nothing has changed, GitHub replies "not modified." GitHub's docs say that when nothing has changed and GitHub answers "not modified," the request doesn't count against your hourly limit, as long as you sent your token with it. So checking an unchanged list costs nothing from that hourly limit. The poller also skips its run when the GraphQL budget is low.

**4. Landing got cheaper, and more honest.** This is the one I'll walk through in detail below.

**5. A check that refuses new GraphQL spenders.** A CI check now refuses a script or scheduled job that would spend the shared GraphQL pool, and it runs in the repos where my agents write those scripts. The written rule is for the agent that reads it, and the check is for the one that doesn't.

## Worked example: landing a pull request

"Landing" is my word for the last step: the checks are green, so merge the pull request. The lander is the small tool my agents call to do that. Here is what that step looked like before and after, slowly, because this is where the outage felt worst.

![Before and after for the lander. Before: it checks status over GraphQL, the budget hits zero, and the result reads checks failed. After: it reads checks over REST with a 20 minute deadline, a rate limit goes to a separate rate limited (wait) result, and the merge is one call pinned to the head commit.](/images/posts/the-budget-everyone-shared-fig2-the-lander-before-and-after-final.png)

*The same lander, before and after.*

**Before.** The lander asked GitHub over GraphQL, "what are the checks on this pull request?" and waited, asking again and again until they finished. On a normal day that worked fine. On November 24, the GraphQL budget hit zero partway through. The next question came back with an error instead of check results. GitHub's docs say that when you're out of GraphQL budget, the reply still arrives as a normal, successful-looking reply with an error message inside, so a tool that isn't looking for that message just sees "no passing checks." The lander saw that and reported failing checks. The agent that asked for the merge saw a red result, and a red result means "go fix your code," so the natural next move is to look for a bug that isn't there.

**After.** Three things are different.

First, the lander reads check runs over REST, which spends from the other budget, and it has a 20-minute deadline, so it can't wait forever.

Second, if GitHub says "rate limited," or the API errors in some other way, the lander exits with its own exit code. An exit code is the number a program hands back when it finishes: zero means it worked, and any other number says what went wrong. So a rate limit no longer looks like red CI. The agent now sees "GitHub didn't answer," which means "wait and try again," not "go fix your code."

Third, the merge itself is one REST call, pinned to the exact commit the checks ran on, the newest commit on the pull request's branch. Pinning matters because if someone pushed a new commit while the checks ran, the merge refuses instead of shipping a commit that nobody checked. And the merge is the one call that must not fail when the budget is tight, so it's now a single call that spends from the other budget.

There's one more small thing I like. The status command my agents run now prints one line showing how much of the GitHub budget is left, and it adds a warning when that drops below 800 points. It gets that number from the plain rate-limit endpoint, not from another board query. That way an agent can check before it starts something expensive.

## What went wrong along the way

The App plan was the big miss, and I've covered it. The smaller one is a little embarrassing. One line in my agents' instructions points at the board-reading rule, and it took three tiny pull requests to make it match the main rule, one of them only to add a missing list marker. Agents are very good at writing rules. Getting the same rule to say the same thing in two places is, apparently, still a three-PR job.

## Put it into practice

If you run more than a couple of automations against one GitHub account, here's what I'd check this week.

- I'd find out who shares the pool first. Every personal token and every app acting as you counts against the same one, 5,000 GraphQL points an hour on a normal account.
- I'd look at the budget before spending it. The rate limit endpoint is free to call, so the number can sit somewhere your agents can see it.
- I'd move the repetitive reads to REST with ETags, because polling a list that rarely changes should cost close to nothing.
- I'd make "couldn't read" different from "empty." A digest that can't load data should error, not report a quiet day.
- I'd give a rate limit its own exit code, since one that looks like failing tests sends someone off to fix tests that aren't broken.
- I'd write the rule down, then add a check for it. The rule teaches, and the check catches the script that didn't read the rule.

## What changes for me

I used to think of rate limits as a ceiling you hit when you do too much. With a group of agents sharing one account, it's closer to a shared resource that any one job can empty for everybody else. So the question I ask about a new script now is "which budget does this spend, and who else is spending it?" instead of "is this call expensive?" The merge, the call that matters most, now spends the least, and when the budget does run out, my agents can tell the difference between "wait an hour" and "your code is broken." That difference alone would have saved me a lot of that Tuesday.
