+++
title = "GitHub tokens for agent fleets — safe automation without paste-a-PAT"
date = "2026-09-11T09:00:00-04:00"
draft = true
author = "Dave Voyles"
description = "How to give coding agents GitHub access without long-lived PATs in chat: short-lived App tokens, a deterministic credential broker, personal vs bot identity, and fail-closed landing."
categories = ["Programming", "AI"]
tags = ["AI agents", "GitHub", "security", "automation", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 7
[cover]
image = "/images/posts/github-tokens-agent-system.png"
alt = "Architecture diagram: agent session through Gatekeeper and gh-app-token to a GitHub App bot for approve/merge, with a separate personal OAuth path for PR creation"
caption = "Two lanes: automation (short-lived App tokens) vs interactive (personal OAuth). PR author stays human."
+++

This post sits with the [Agent production system](/posts/agent-production-system/) series — same thesis as [eval gates](/posts/eval-gates-not-theater/) and [human approval](/posts/human-approval-merge-button/), applied to **how agents authenticate to GitHub**. Prefer the floor **without** an App first? See [Landing floor without a GitHub App](/posts/landing-floor-without-a-github-app/).

Most agent demos treat GitHub as “put a PAT in the env and hope.” That works until the token leaks into a transcript, the rate limit collides with your interactive work, or an agent tries to approve its own PR and the platform says no.

Here is the shape I use in production: **two identities, short-lived bot tokens, a deterministic broker, and a landing path that cannot rubber-stamp itself.**

![GitHub tokens in the agentic system — agent → Gatekeeper → gh-app-token → GitHub App API → bot approve/merge; separate personal OAuth path authors the PR](/images/posts/github-tokens-agent-system.png)

*One App install, many mints. Agents call the broker; they do not each own long-lived PATs. Machine secrets stay out of git.*

---

## The problem in one sentence

Agents need GitHub to open PRs, read checks, and sometimes merge — but **granting credentials is a security boundary**. That boundary should not depend on how persuasive the model feels today.

If the agent decides “I need admin, mint me something broad,” you have already lost least-privilege. If the human pastes a classic PAT into chat every time something 401s, you have lost auditability and safety.

## Two identities on purpose

Think of two lanes:

| Lane | Identity | Lifetime | Used for |
|------|----------|----------|----------|
| **Interactive** | Your personal GitHub user (OAuth / `gh auth login`) | Long-lived session | Work *you* are doing in the terminal: `gh pr create`, exploratory `gh`, normal `git push` as yourself |
| **Automation** | A **GitHub App** installation (bot) | **~1 hour** installation tokens | Scheduled jobs, approve/merge after gates, CI-shaped automation that must not share your personal quota story |

Agents do **not** each own an App. They call a single mint path that talks to **one App install**, gets a **time-limited** token, and throws it away when done.

The diagram above is the map; in prose:

**Interactive** stays on the personal OAuth path (`gh` / keychain). **Automation** stays on the App (Gatekeeper → mint → ~1h token → bot approve/merge after gates). Mixing them is how you get “the bot authored the PR and now cannot approve it” failures — GitHub correctly refuses self-approval.

### Rule that saves pain

**PR creation stays on the human (or human-linked) identity.**  
**Approval and merge after gates can use the bot identity.**

If you mint an App token to *create* the PR just to dodge a rate limit, you often poison the landing path: the App cannot approve its own PR, and your “unattended land” script fails late. Better to wait out the window or keep create on the personal lane.

## Pattern: deterministic credential broker

I do not let the agent reason its way into credentials. I use a **broker** — plain code, fixed schema, fixed outcomes:

1. **Request** — e.g. action, system (`github`), target (repo), optional scope/justification  
2. **Policy in code** — least privilege by default; broad scope needs justification or is denied  
3. **One of:**
   - **GRANT** — short-lived credential on stdout (never logged as the secret)  
   - **DENY / ESCALATE** — structured message on stderr (blocker → recommendation → reasoning)  
4. **Audit line** — metadata only (who/what/when/outcome), **never the token value**

The *caller* can be an LLM agent. The *decision* cannot. That is the same philosophy as [eval gates](/posts/eval-gates-not-theater/): security boundaries are not free-form prose.

Public write-up of the pattern (implementation-agnostic): credential broker as schema → policy code → grant or escalate, with append-only audit.

### What “self-heal” means before bothering a human

When GitHub says 401/403, the agent should **not** open with “please paste a new PAT.” A useful ladder looks like:

1. Is the **right identity** active for this kind of work?  
2. For automation: **re-mint** — hourly tokens *look* like revocation when they are only expired.  
3. Does the **App installation** cover this repo with the **permissions** you need? (Scope gaps are not fixed by minting harder.)  
4. Escalate with a **structured** blocker only after the broker refuses or the install is actually broken.

Asking a human for a brand-new long-lived token is a last resort (e.g. new machine, missing App private key) — not the default recovery path.

## Landing floor: bot mode is optional, gates are not

Automation should not mean “merge anything that compiled.”

A sane **landing floor**:

1. **Intent** present on the PR (why this change exists)  
2. **CI** green  
3. **Review receipt** tied to the **exact commit SHA** being landed (so a new push invalidates the old “LGTM”)  
4. **Then** — if bot credentials exist — App **approves and merges**; if not, print the exact human merge command  

| Mode | App configured? | Behavior |
|------|-----------------|----------|
| **Human** (default) | No | Validate gates; print safe merge instructions |
| **Bot** | Yes | Same gates; then App approve + merge |

Absent App credentials is **not** an error. It is the zero-config default for people who want the discipline without unattended merge.

That pairs with [human approval](/posts/human-approval-merge-button/): autonomy is earned per action class. Merge is still a product decision; the bot is a **narrow** second principal, not a second you with admin forever.

## Least privilege in practice

Minimum App permissions for bot land (illustrative — tighten further if you can):

- Pull requests: read/write (approve)  
- Contents: read/write (merge)  
- Commit statuses: read/write (post/verify review receipts)  

Private key and config live **outside any git repo** (e.g. under `~/.config/gh-app/`), mode `600` / directory `700`. Never commit `config.env` or the `.pem`.

When verifying a mint in a session or log:

```bash
# Length only — do not echo the token into chat or CI logs
TOKEN="$(broker-or-mint …)"
echo "mint ok, length=${#TOKEN}"
unset TOKEN
```

## How this maps to the agent production system

| Constellation idea | Token story |
|--------------------|-------------|
| [Eval gates](/about/?node=eval) | CI + SHA-keyed review receipt before land |
| [Human approval](/about/?node=human) | Escalation when broker DENYs; human mode land |
| [Orchestrator](/about/?node=orchestrator) | Calls broker; does not own long-lived PATs |
| [Docker / production](/about/?node=docker) | Scheduled automation uses App lane, not laptop OAuth cosplay |

Tokens are not a side quest. They are part of the **control plane**.

## What this is *not*

- A recommendation to paste PATs into agent prompts  
- A claim that unattended merge is required  
- A dump of private runbook internals or live credentials  
- Permission to skip review because “the bot said so”

## Series context

| | |
|--|--|
| Overview | [How I run an agent production system](/posts/agent-production-system/) |
| Related | [Eval gates](/posts/eval-gates-not-theater/), [Human approval](/posts/human-approval-merge-button/), [What I will not automate](/posts/what-i-will-not-automate/) |

---

**Bottom line:** give agents **paths** to mint **short-lived, scoped** GitHub access through **code-defined policy**, keep **human and bot identities separate**, and make **land fail closed** on missing receipts. That is how token automation stays useful without becoming a slower way to leak `ghp_…` into a chat log.
