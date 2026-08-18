# Series operator card

Short playbook for Dave + agents working on davevoyles.com **series posts**.  
Full agent production schedule: [`agent-production-system.md`](agent-production-system.md).  
Writing conventions: [`../authoring-guide.md`](../authoring-guide.md).  
New topic ideas (do not draft the post): [`../idea-playbook.md`](../idea-playbook.md).

---

## Preview scheduled / draft posts (local)

```bash
cd ~/REPOS/DaveVoylesdotCom
git submodule update --init --recursive   # if themes/PaperMod is empty
hugo server -D -F
```

Open **http://127.0.0.1:1313/**:

| Flag | Effect |
|------|--------|
| `-D` | include `draft = true` posts |
| `-F` | include **future-dated** posts (`date` still in the future) |

Production builds use neither flag — future posts stay hidden until their `date`.

| Example | URL | Goes live (ET) |
|---------|-----|----------------|
| Overview (live) | `/posts/agent-production-system/` | already live |
| Eval gates | `/posts/eval-gates-not-theater/` | 2026-07-28 09:00 |
| Tokens | `/posts/github-tokens-for-agent-fleets/` | 2026-08-18 09:00 |

---

## Auto-publish model (Approach A)

1. Post on `main` with **`draft = false`** and a **future `date`** in front matter.  
2. GitHub Actions rebuilds the site **daily** (`cron: 0 14 * * *` ≈ 10:00 ET) plus on every push.  
3. Hugo **excludes future content by default**, so the post appears on the first rebuild **after** its `date`.

No manual flip on release day for scheduled series posts. See [`.github/workflows/hugo.yml`](../../.github/workflows/hugo.yml).

**Caveat:** posts are “ready to ship” in the public repo before the date (not secret) — only the live site hides them until then.

---

## Ask an agent for a new post

Paste (edit topic/angle):

> Draft a series post for davevoyles.com.  
> **Topic:** …  
> **Angle:** …  
> **Claim-safe** — only facts in `docs/claim-safe-facts.md`.  
> Prefer `./scripts/new-series-post.sh <slug> <weight> <ISO-date>` then edit the body.  
> Or create `content/posts/<slug>.md` with **`draft = false`**, future **`date`**,  
> `series = ["Agent production system"]`, `series_weight = N`, `[cover]`,  
> add a row to `docs/series/agent-production-system.md`.  
> Do **not** hand-write prev/next tables (auto from layout).  
> Run `make check` before commit.  
> If not ready to auto-ship, use **`draft = true`**.

**Hard rules:** see [`../claim-safe-facts.md`](../claim-safe-facts.md).

---

## Ship early / unscheduled (manual)

Still available when you want something live **before** its scheduled date:

```bash
./scripts/release-series-post.sh <slug>   # draft=false + date=now (if it was a draft)
# or edit front matter: set date to now
git add content/posts/<slug>.md
git commit -m "publish: <short title>"
git push origin main
```

Or tell the agent: **“Publish series part N now”** — it should bump `date` to now, commit, and push (only when you explicitly ask).

---

## Images

| Kind | How |
|------|-----|
| Conceptual covers / mood | Follow [`../image-playbook.md`](../image-playbook.md): 4–5 options from the post, Dave picks, then `static/images/posts/` |
| Exact architecture labels | Export archify/HTML (or SVG); avoid pure image-gen for dense labeled diagrams |
| Real photo | You provide file; agent wires path (e.g. sidebar `homeInfoParams.Avatar`) |

Ask: *“Propose 4–5 covers for this post, then stop.”* After you pick: *“Wire option N as the cover.”*

---

## Schedule model

- Scheduled posts: **`draft = false`** + future **`date`** + daily Pages rebuild.  
- Not ready yet: **`draft = true`** (excluded forever until flipped).  
- Release day usually requires **no** manual action for scheduled posts.  
- Early release: set `date` to now + push `main`.

---

## Quick reference

| Goal | Action |
|------|--------|
| Preview scheduled | `make preview` |
| New post (scaffold) | `./scripts/new-series-post.sh <slug> <weight> <date>` |
| New post (manual) | `draft=false` + future `date` + series doc row (slug/date only — no Status) + `make series-schedule` |
| Validate | `make check` |
| Hold a post | `draft=true` until ready |
| Ship early | bump `date` to now → commit → push |
| Images | Ask for cover or diagram export |
| Schedule list | [`agent-production-system.md`](agent-production-system.md) |
| Claim rules | [`../claim-safe-facts.md`](../claim-safe-facts.md) |
