+++
date = "2026-12-11T08:00:00-05:00"
draft = false
title = 'My cheap tokens ran out my whole week in one night'
author = 'Dave Voyles'
description = "I moved my coding agents' helpers onto a cheap model with a weekly token allowance, and one night of work emptied it. Almost all of it was cached re-reads, which barely cost anything but still counted in full. Here's what I measure now."
categories = ['Programming', 'AI']
tags = ['AI agents', 'automation', 'agent tooling', 'ops', 'Build-log']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/cheap-tokens-still-count-cover.png"
social = "/images/posts/cheap-tokens-still-count-cover-social.png"
alt = 'A fuel gauge reading empty next to a receipt that shows almost nothing spent'
caption = 'The bill said almost nothing. The gauge said empty.'
+++

The day after I moved my agents' helpers onto a cheap model, the model started turning them away. Every call came back with the same message, saying I had used 125.2 million of my 125 million weighted input tokens for the rolling week. It was the first full day on the new plan, and the week was already gone.

The odd part was the money. The model was cheap, and almost everything I'd sent it was the cheapest kind of token it sells. So how do you use up a week's allowance while barely spending anything?

The answer is that the allowance and the bill were counting different things. The bill gave a big discount for tokens the provider had already seen. The allowance didn't care, and counted every one of them at full weight. Ninety-eight percent of what my agents sent that night was cheap on the bill and full weight on the allowance.

**Before you trust a budget, find out what unit it actually counts, because the price of a token and its weight against a cap can be very different numbers.**

> In short: my agents re-send their whole conversation on every call, the provider caches most of it, and the cache made the bill tiny. The weekly cap counted cached tokens in full, so one night of normal work used the week. I now track the cap's unit, alert at 50 and 80 percent, and keep a tested fallback for when it runs dry.

{{< motion-figure gif="/images/posts/cheap-tokens-still-count-fig1-burst-fills-the-cap.webp" still="/images/posts/cheap-tokens-still-count-fig1-burst-fills-the-cap-final.png" width="1600" height="1216" alt="One agent conversation growing call by call. Each call re-sends everything before it: a thin fresh-input slice on top of a growing block of cached re-read. Two meters underneath, the bill moving a hair per call while the weekly cap moves by the whole block, ending with the bill near zero and the cap full." >}}

## How the night went

I run a main agent that hands smaller jobs to helper agents, which I'll call subagents: one reviews a change, another explores a codebase, another writes a test. The main agent stayed on a stronger model. On a Saturday, every subagent moved to a cheap, fast model through a relay plan with a fixed allowance of 125 million input tokens in any rolling seven days.

That sounded like plenty, and on paper it was. Then I looked at a seven-hour overnight window. Almost all of the usage below landed in a burst of two hours and eighteen minutes:

| What | Amount |
|---|---|
| Calls to the model | 1,700 |
| Agent sessions | 53 |
| Input tokens, total | 124.9 million |
| Of which were cache reads | 122.7 million |
| Average input per call | about 73,000 |

That's 98 percent of the input coming from the cache. The next day, subagent calls started coming back with an HTTP 429, the "too many requests" error, and a message saying the 7-day input cap was used up.

## Why agents re-read so much

A language model doesn't remember anything between calls. Each time an agent takes a turn, it sends the whole conversation again: the instructions, the files it read, the tool output, every earlier step. A long agent session is mostly re-sending, with a thin slice of new text on top.

Providers know this, so they cache it. The model's documentation says its context caching is on by default, and when a new request starts with the same text as an earlier one, that overlapping part is read from the cache and counted as a "cache hit." On the model's price list, a cache hit costs a tiny fraction of a cache miss.

On price, that works in your favor. A subagent that has already read about 73,000 tokens of a codebase pays the cache rate to re-read them on its next turn. My mistake was assuming the allowance would follow the price. The relay's plan counts cached input against the cap at full weight, and I hadn't done the multiplication: 73,000 tokens a call, times 1,700 calls.

![Two columns for the same night. On the left, what the bill sees: a short bar for fresh input and a sliver for cached input. On the right, what the cap sees: the same fresh bar plus the cached bar at full height. Same numbers, two rulers.](/images/posts/cheap-tokens-still-count-fig2-bill-vs-cap.png)

## What I changed

There were four fixes, and they came in the order you'd expect from someone who just got locked out.

When the cheap model returns that 429, the subagent now moves to a second model, then a third. I didn't want to trust this on paper, so it got tested with the plan actually empty. The log shows the rate-limit error, then the switch to the next model about a hundredth of a second later.

My usage report counts in the cap's unit. A small read-only script prints calls, fresh input, cache reads and output for the last day and the last seven days, and adds fresh input and cache reads together before comparing them to the cap, since that's the sum the cap counts. A second command breaks usage down by provider, model and role, so I can see which kind of subagent is doing the heavy re-reading.

That command can push a notification to my phone at 50 percent and 80 percent of any cap, once per level, and re-arms when usage drops. The caps live in one table in the docs, not in the code, so changing plans means changing one row.

I moved to the relay's next tier, which has five times the weekly input. I also told subagents to compress their conversation sooner, at about 35 percent of the context window, with a target of under 85,000 tokens of input per call on average. I didn't cap how many turns an agent gets. Cutting turns would save tokens by making agents quit halfway through a job, and then I'd pay again to redo it.

## What I check before trusting a budget

If you're putting agents on any plan with a token allowance, the order I'd go in starts with the plan's terms, which answer one question in a sentence: does the cap count cached input, and at what weight? From there it's one real session, measured fresh and cached separately, multiplied by how many sessions you run in a week. If that number is near the cap, you'll hit it, no matter how small the bill looks.

Then build the boring parts before you need them: a report in the cap's own unit, an alert well before the limit, and a fallback you've watched work with the plan empty. I have all three now because I skipped them the first time.

The price tells you what a token costs. The cap tells you how many you get.
