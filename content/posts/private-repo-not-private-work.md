+++
date = "2026-11-02T10:00:00-05:00"
draft = true
title = 'A private repo is not private work'
author = 'Dave Voyles'
description = 'The first time my nightly recap ran on its own, it marked 10 of its 12 items as too private to write about. Nothing was secret. The rule said "private work," and the run read that as "lives in a private repo." The checks all passed anyway.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'privacy', 'automation', 'AI agents', 'checks']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/private-repo-not-private-work-cover.png'
alt = 'A row of twelve plain gray folders, ten of them stamped PRIVATE.'
caption = 'Ten of twelve stamped private. Nothing in them was secret.'
+++

Every night, a recap of what my coding agents shipped that day gets written into a file, one row per piece of work, and each row carries a small flag that says whether it is safe to write about in public. That flag matters to me because it is where the ideas for this blog come from. My blog bot reads the recap once a week, throws out every row marked private, and turns what is left into a short list of post ideas. If the flag is wrong in the cautious direction, nothing leaks, which is nice, and nothing gets written, which is less nice.

For a while I built that recap by hand at the end of a long session. Then I set it up to run on its own after midnight, and before I trusted it, I had it do a practice run on a day I had already recapped by hand. The hand-built version had 17 rows and marked 16 of them public. The unattended version had 12 rows and marked 2 of them public. Same day, same 27 merged pull requests, same seven projects, and the automated one had decided that almost all of my work was too private to talk about.

The fix landed the same night, and the lesson is one I expect to keep relearning: **a privacy rule has to say what is sensitive, not where it lives. And a filter that throws away almost everything will pass every check you wrote for a filter that leaks.**

![One day of work, 27 merged changes, splits into two recaps. The hand-built recap marks 16 of 17 rows public. The unattended run marks 2 of 12 public. Both pass the check.](/images/posts/private-repo-not-private-work-d1.webp)

*Same day, same 27 merged changes. The hand-built recap kept 16 of 17 rows public; the unattended run kept 2 of 12. Both passed.*

## In brief

- The unattended run marked 10 of 12 rows as not safe to write about. The hand-built recap of the same day marked 1 of 17 that way.
- The rule said to mark "private work" as private. Six of my seven projects live in private repositories on GitHub, so the run read it as "anything in a private repo."
- The file's own check passed on both versions, because it checked that rows were well formed and linked, not whether anything usable was left.
- The fix lists what counts as sensitive and warns when fewer than half the rows survive. A second practice run of the same day kept 13 of 14.

## Words I use

- **Recap** is the nightly file that lists what my agents shipped that day. Each item in it is a **row**.
- **Pull request** is a proposed change that gets reviewed and merged. Each row links to the merged ones it came from.
- **Private repo** is a code project on GitHub that only I can see. Most of mine are private because they are personal tooling, not because they hold secrets.
- **The public flag** is a yes or no on each row: yes means it is fine to write about, no means skip it.
- **Usable** is my word for a row that is marked public and links to at least one merged pull request. Those are the only rows my blog bot will consider.

## Same day, two answers

This one was easy to diagnose because the inputs were identical. Both versions of the recap listed the same 27 merged pull requests across the same seven projects. Every row in both files had valid links. The run's log showed no permission errors, only four advisory warnings. The automated run grouped the work into fewer, larger rows, 12 instead of 17, which is a fair editorial choice and not a bug. The only real difference between the two files was the public flag.

The run even explained itself. In its own notes it said, more or less, that most items were marked private as private work, and that only two items were public. It applied the rule exactly as written.

The rule as written was "public: false for private work." The longer version in the recap's instructions said private work, hosts, secrets, family data. When I wrote that, I meant private as in personal or sensitive: a hostname on my home network, a key, something about my kids. Six of my seven projects are private repositories, so the run had a perfectly reasonable second reading available, and it took it.

It was not even consistent about it. Two of the projects whose rows it marked public are also private repos. So it was not applying "private repo means private" as a clean rule either, which is about what you get when a model resolves an ambiguous phrase one row at a time.

## Why the checks did not catch it

The recap has a checker that runs before the file is saved. It confirms the file has the right shape, that every row has the fields it should, and that the links point at real merged pull requests. Both files passed it. Every check I had was written to stop the recap from saying too much: a broken link, a missing field, a row with no source. None of them could notice the recap saying too little, because a file with 2 usable rows out of 12 is perfectly well formed. It just does not do its job.

![A checker that looks at shape, fields and links. A file with a broken link is blocked. A thin file with 2 usable rows out of 12 passes straight through.](/images/posts/private-repo-not-private-work-d2.webp)

*Every check stopped the recap from saying too much. Nothing stopped it from saying too little.*

The cautious failure was cheap this time, because I caught it on a practice run before the recap ran unattended for real. If it had shipped, the likely outcome is not a leak. It is that my weekly idea list gets quietly thinner for a few weeks, I assume I had a slow stretch, and I never find out that the recap had been throwing most of my work away.

## The fix

The change had two small parts.

The first was the wording. The rule now starts from the opposite default: my own engineering work is public, whether its repo is private or public, and repo visibility is never the test. A row gets marked private only when writing about it would expose one of a short list of things: hostnames, IP addresses or internal URLs; secrets or credentials; family, child or personal data; client or employer confidential material; or unpublished drafts. Because it is a list, a model has much less room to pick a second meaning.

The second part was a guard for the failure that had no guard. After the checker runs, the recap now logs how many rows it wrote, how many are public, and how many are usable. If there are at least five rows and fewer than half of them are usable, it raises a warning. It is a warning and not a failure, on purpose. Some days really are mostly sensitive, and I would rather the recap still land and tell me it looks thin than refuse to save.

The tests cover both sides of that guard: a low ratio warns, a normal ratio does not, and a day with fewer than five rows stays quiet. Then I re-ran the practice run on the same day. It wrote 14 rows, marked 13 public, and all 13 were usable, which is close enough to the hand-built 16 of 17 for me to stop worrying.

## Two jobs that look like one

"Is this private" was really two questions sharing one flag.

One question is whether a piece of work should be written about at all. That is a judgment about content, and it belongs on the row.

The other is whether the writing will leak names, paths or links that should stay internal. That is a redaction job, and in my setup it happens later, when the blog bot turns a row into a post idea and strips out private project names and internal links before anything is drafted. The recap file keeps those links on purpose, because the recap is for me.

The unattended run folded the second question into the first. It saw a private repo name and marked the whole row private. Once the two jobs are split, the flag can be generous and the redaction step can be strict.

## Put it into practice

If you have an automated step that filters for privacy, safety or anything else where "when in doubt, leave it out" sounds responsible:

- **List what is sensitive.** Concrete kinds of data leave less room than "private work."
- **Say what is never the test.** Naming the wrong reading is cheaper than hoping nobody picks it.
- **Count what survives.** Warn when output drops well below what a normal day produces. A schema check cannot do that.
- **Practice on a day you already know.** I only saw 2 of 12 because I had a hand-built 16 of 17 to compare against.

## What changes

Over-caution is still the cheaper mistake, but it is not free, and it is much quieter. Nothing alarms and nothing looks broken. The cost shows up as posts and fixes you never notice are missing.

This post came out of that recap, by the way, from a row marked public.
