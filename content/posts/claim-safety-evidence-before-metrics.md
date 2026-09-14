+++
title = "Claim safety: evidence before metrics"
date = "2026-08-11T09:00:00-04:00"
draft = true
author = "Dave Voyles"
description = "An agent writes words that sound finished. A claim is a number, a title, or who made a thing. Evidence is the proof you can point at. If the proof is missing, the number does not ship."
categories = ["Programming", "AI"]
tags = ["claim safety", "AI agents", "resume", "TPM", "writing"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 5
[cover]
image = "/images/posts/claim-safety-fluent-not-true.jpg"
alt = "Two steel plates on a bench — one honestly stamped, one only shiny"
caption = "Agents sound finished. Sounding finished is not the same as true."
+++

This is **part 5** of the [Agent production system](/posts/agent-production-system/) series. Previous: [From Xbox SLAs to agent fleets](/posts/xbox-slas-to-agent-fleets/).

## Words I use below

**Agent.** A program that writes words or code for you, in a chat.

**Claim.** A sentence that says a number, a job title, or who made a thing. It can be true or false.

**Evidence.** The proof you can point at. A file. A date. A source.

**Metric.** A number inside a claim.

**Allowlist.** The short list of numbers I am allowed to print in public. If a number is not on that list, it does not ship.

**Authorship.** Who made a thing. Running a tool someone else wrote is not the same as making it.

**Gate.** A check that can say no. A wish in the instructions is not a gate.

Those seven words are the whole toolkit. Now the point.

Agents sound finished. Sounding finished is not the same as **true**, and that gap is where public trust goes to die if you let a fluent draft decide what ships.

Claim safety is the habit of tying every public number, title, and authorship line to evidence. If an agent can write a blog post, open a change, or rewrite a **résumé** (a one-page story of your work for a job), it can also print a confident lie with the same calm tone it uses for a careful truth. The fix is not “please be careful” in the instructions. The fix is a gate: **block, or stop for a person**. Do not ship.

---

## Why agents fail this by default

An agent is built to finish the sentence. A résumé, a README, and a blog post all reward a sentence that sounds impressive, and once you put those surfaces next to a model that never runs out of confidence, you get the same mess every time: the draft sounds sure, the metric feels right, and nobody can point at a source.

The collision usually looks like this:

- **Round numbers that feel right** — a dollar figure rounded up, a speed win with no “before,” a “lots of agents in production” counter invented for rhythm
- **Verb inflation** — “led” where the honest word was “helped,” “built” where the honest phrase was “extended and operates”
- **Implied invention** — treating a tool other people wrote as if you authored it, because you run it hard
- **Metrics with no date and no source** — numbers that die when someone says “show me”
- **Present-tense title drift** — “Senior Technical Program Manager (TPM) at Xbox” as a current job when the true line is **former**

None of that needs a bad person. It needs a system that wants to sound done. If your agents can publish, claim safety has to be a **gate**, not a writing preference, because preferences evaporate the first time a draft needs to look finished by Friday.

## Picture this: the same sentence, two outcomes

An agent drafts a line for a public page:

> “I built a multi-agent framework used in production across dozens of teams, cutting publish time by 90%.”

That sentence sounds finished. It is also a bomb if you cannot defend every clause, and sounding finished is how bombs get waved through security:

| Fragment | What evidence would need to exist |
|----------|-----------------------------------|
| “I built” | You made the thing. You did not only plug it in. |
| “multi-agent framework” | A named system you own — not one you **extend and operate** |
| “dozens of teams” | A count you can stand behind |
| “90%” | A before number, an after number, and what you measured |

In my system that draft does not get to “sounds good, ship it.” It hits the allowlist. If the number is not on the list, or the authorship verb overclaims, the path is **stop**. Rewrite inside evidence, or ask a person. Same muscle I used as a **former** Senior Technical Program Manager at Xbox: confidence is not a gate. Checks are.

![False path ships a confident lie; fix path runs the draft through an allowlist gate before publish](/images/posts/claim-safety-ship-vs-gate.png "Sounds finished is the false path. Evidence before metrics is the fix.")

*ELI10: left path ships because it sounds done; right path asks the allowlist, then publish or block and escalate.*

**Example: the 90% sentence.** The agent wanted a round win. “90% faster” sounds like a story, and stories travel well in a résumé. It has no before. It has no after. It has no scope. The honest Xbox line is already on the allowlist: publish went from **12h → 30m**. That is a before and an after. It can survive “show me.” The 90% line cannot. The gate does not soften 90% into “almost 90%.” It throws the number out, which is less romantic than a rewrite, and much more useful.

**Example: the job that isn’t current.** The same draft wants a strong present-tense title: “Senior TPM at Xbox.” That used to be true. It is not true now. The allowlist says **former**. A gate that only hunts for fake dollars will miss this, which is how you end up with a polished lie about employment. A real gate also hunts for a job you do not have anymore. I caught it because the title is on the same short list as the numbers. Chat saying “it sounds better in the present tense” is not evidence, and neither is the model’s tone of polite certainty.

## Rules I actually use

These are the same rules that bound [About](/about/) and this series. They live in one public file in this site’s repo (`docs/claim-safe-facts.md`). Agents and humans argue with that file, not with folklore:

1. **Verified figures only** — **10+** years at Microsoft, **~$50M** commerce program, **12h → 30m** publish target, **20+** containers. No vanity counters without a source.
2. **Authorship humility** — prefer “**extended and operates**” (or “integrated and operates”) for agent platforms. Do not claim you invented a tool other people wrote.
3. **Past-tense where true** — former Xbox / Microsoft TPM. Not a fake current employer.
4. **No logo soup** — I will name Azure and Docker as things I actually run. I will not list fashion-statement tools I do not stand behind.
5. **Public = stricter** — if it is on davevoyles.com or a résumé, the bar is higher than a private scratch note.
6. **Stop and ask on disagreement** — if two sources conflict, do not silently pick the more impressive one.

The allowlist is short on purpose. A short list forces soft language (“high-stakes platform work,” “cross-team delivery”) where a hard number does not exist yet, and that soft language is not a failure — it is the system refusing to invent precision it does not own.

## Evidence-backed tooling

[Resume Builder](https://github.com/DaveVoyles/resume-builder) exists because job search is a claim surface. An agent that edits a résumé without evidence just writes faster bullets with weaker truth, which is a productivity story only if you measure words per minute instead of sentences you can still defend next month.

The product idea is simple: matching a role, and writing the words, stay attached to what you can defend. Same idea as a gate on code — different artifact. A tailored résumé that invents impact is not “optimized.” It is a lie that looks like productivity.

That tooling also keeps this site honest. The About numbers, the Xbox transfer post, and this post all pull from the same habit: if a number is not allowed, it does not appear as a hard claim. Soft paraphrase is fine. Inflation is not.

The **homelab** — the computers I run at home — is the same test. I run **20+** containers. That is on the list. It is not Xbox. It does not become “enterprise scale” because the sentence would land harder. The résumé does not get a bigger number than the site. Public is public.

## Where the check lives

Claim safety is not one checkbox at the end. It is a job at every layer that touches language or numbers:

| Layer | Claim-safety job |
|-------|------------------|
| Search | Prefer sources over invention. Cite when the system can. |
| Writer agents | Draft only inside evidence. Refuse to “finish” a metric that has no source. |
| Gates | Block or flag unsupported metrics, present-tense job drift, stolen authorship. |
| A person | Still owns the go / no-go on public claims that survive the checks. |
| The live site | Publish only what survived the funnel. |

On the map: start at [Eval gates](/about/?node=eval) and [Search](/about/?node=search). Public claims also sit under [Human approval](/about/?node=human) for a reason — when the model is sure and the evidence is thin, a person owns the last call, which is less exciting than full autonomy and much harder to fake.

![Claim safety validation workflow: agent draft and source of truth enter an eval gate, then publish or block and escalate to a human](/images/posts/claim-safety-validation-workflow.jpg "Draft meets allowlist at the gate — publish only when evidence holds")

## Theater vs real claim safety

| Theater | Real claim safety |
|--------|-------------------|
| “Don’t make things up” in the instructions | An allowlist the agent cannot waive |
| Numbers that “sound about right” | Numbers on the list, with context |
| “I built X” for every tool you run | “Extended and operates” when that is the truth |
| Always-impressive résumé drafts | Drafts that stop when evidence is missing |
| Fixing one bad sentence after publish | Gates that catch the pattern before it goes live |

![Theater versus real gates: prompt-only “don’t invent” on the left; allowlist, eval gate, and evidence-backed résumé path on the right](/images/posts/claim-safety-theater-vs-real-light.png "Instructions are not a gate — an allowlist that can block is")

*ELI10: theater is a polite wish in the prompt; real claim safety is a short list that can say no.*

If your claim check never fails, you do not have claim safety. You have decoration. The tell is what happens when a draft wants a metric that is not on the list. A real system stops. A theatrical one rephrases until it sounds softer and ships anyway, which is how you get a site full of almost-true numbers and a résumé that collapses under one “show me.”

## What this is not

- Not a ban on storytelling — stories without invented metrics are fine
- Not a claim that my home setup equals Xbox global traffic
- Not permission to invent “N agents in production” or dollar figures outside the allowlist
- Not original authorship of every open-source stack I run hard

Claim safety is boring on purpose. Boring is how public trust survives a model that always sounds done.

---

**Bottom line:** impressive is easy. **Defensible** is the product. If your agents can publish, your gates must be able to say “show me the source.”
