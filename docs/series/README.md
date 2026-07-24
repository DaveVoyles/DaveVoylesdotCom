# Series operator card

Short playbook for Dave + agents working on davevoyles.com **series posts**.  
Full agent production schedule: [`agent-production-system.md`](agent-production-system.md).  
Writing conventions: [`../authoring-guide.md`](../authoring-guide.md).

---

## Preview drafts (local)

```bash
cd ~/REPOS/DaveVoylesdotCom
git submodule update --init --recursive   # if themes/PaperMod is empty
hugo server -D
```

Open **http://127.0.0.1:1313/** — `-D` includes `draft = true` posts.

| Example | URL |
|---------|-----|
| Overview (live) | `/posts/agent-production-system/` |
| Tokens draft | `/posts/github-tokens-for-agent-fleets/` |
| Landing floor draft | `/posts/landing-floor-without-a-github-app/` |

Without `-D`, drafts are hidden (same as production / GitHub Pages).

---

## Ask an agent for a new post

Paste (edit topic/angle):

> Draft a series post for davevoyles.com.  
> **Topic:** …  
> **Angle:** …  
> **Claim-safe** — only verified About metrics; no invented authorship of upstream tools.  
> Create `content/posts/<slug>.md` with **`draft = true`**, add a row to  
> `docs/series/agent-production-system.md`, cross-link the series table on related posts,  
> and **do not publish** until I say so.  
> Optional: cover under `static/images/posts/` + `[cover]` front matter.

**Hard rules:** former Xbox TPM (past tense); agents-first; Azure/Docker yes; no Terraform/K8s as skill claims; prefer “extended and operates.”

---

## Release one post (publish)

```bash
./scripts/release-series-post.sh <slug>
git add content/posts/<slug>.md
git commit -m "publish: <short title>"
git push origin main
```

Examples:

```bash
./scripts/release-series-post.sh github-tokens-for-agent-fleets
./scripts/release-series-post.sh landing-floor-without-a-github-app
```

Or tell the agent: **“Publish series part N”** / **“Release the tokens post”** — it should run the script, commit, and push (only when you explicitly ask to publish).

---

## Images

| Kind | How |
|------|-----|
| Conceptual covers / mood | Agent generates (console green / dark ops aesthetic) → `static/images/posts/` |
| Exact architecture labels | Export archify/HTML (or SVG); avoid pure image-gen for dense labeled diagrams |
| Real photo | You provide file; agent wires path (e.g. sidebar `homeInfoParams.Avatar`) |

Ask: *“Add a 16:9 cover matching the site theme; set `[cover]` in front matter.”*

---

## Schedule model

- Drafts stay **`draft = true`** with a planned date in the series table.  
- Nothing ships early.  
- Release day = flip draft (script) + push `main` → GitHub Pages rebuild.

Prefer this over auto-future dates unless you also have a regular Hugo rebuild cron.

---

## Quick reference

| Goal | Action |
|------|--------|
| Preview | `hugo server -D` |
| New post | Agent + “draft=true, claim-safe, update series doc” |
| Ship | `./scripts/release-series-post.sh <slug>` → commit → push |
| Images | Ask for cover or diagram export |
| Schedule list | [`agent-production-system.md`](agent-production-system.md) |
