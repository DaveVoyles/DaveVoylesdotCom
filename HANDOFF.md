# Handoff

**Plan:** `docs/design/0001-rebuild-davevoylescom-blog.md` (plan 0001). Orchestrated this session; paused mid-D6 at the user's request to compact context. This file replaces the stale pre-orchestration handoff.

## Done — merged, live-verified

D1, D2, D3, D4, D5, D9 are all merged to `main` and confirmed live on `https://davevoyles.com`:

- **D1** — Hugo site + GitHub Actions deploy pipeline (PR #11). Workflow at `.github/workflows/hugo.yml` includes an automated post-deploy smoke test (`curl` the deployed URL, retry 5x).
- **D2** — Custom domain wired (PR #14). Namecheap DNS (`@` A records → GitHub Pages IPs, `www` CNAME → `davevoyles.github.io`) updated live by Dave in-browser (I can't submit forms/auth); MX/SPF/Google-verification TXT records confirmed untouched. Dave confirmed he doesn't use email forwarding on this domain anyway (uses a separate personal Gmail) — the MX record count changing (7→5) mid-session is a non-issue regardless of cause.
- **D3** — `scripts/recover_wayback_content.py` (PR #12, follow-up fixes in later commits). Pulls HTML + images from the Wayback CDX API into `content-recovery/staging/{html,images}/` (gitignored). Supports `--limit N`, `--dry-run`, `--images-only`, `--html-only`. Idempotent/resumable (skips existing files).
- **D4** — `scripts/process_images.py` (PR #15). Resizes to 1600px max edge, compresses, writes to `static/images/`. Requires a dedicated venv at `scripts/.venv` (Pillow — `pip install` is blocked on system Python by PEP 668, don't fight it, just use the venv). Never makes an image bigger unless it genuinely needed resizing.
- **D5** — `scripts/convert_posts.py` (PR #16). Converts recovered HTML into `content/posts/*.md` with TOML front matter, rewrites image refs to D4's paths, uses same `scripts/.venv` (+ beautifulsoup4, markdownify).
- **D9** — `docs/authoring-guide.md` (PR #13).

**Current `main` state** (as of this handoff): 76 files in `content/posts/` (75 real posts + `hello-world.md`, D1's placeholder test post — deliberately left in place, not part of this plan's scope to remove), 536 images in `static/images/`.

## In progress — two background recovery processes still running

These were started mid-session to grow the content/image sets beyond the snapshots already merged. **Check if they're still alive before assuming their state**:

```bash
ps -p 89859   # HTML-only recovery, in /private/tmp/dv-d5-html-conversion (git worktree, branch feat/html-markdown-conversion, already merged — worktree is stale but still has the running process's cwd)
ps -p 74862   # images-only recovery, in /private/tmp/dv-d4-image-pipeline (git worktree, branch feat/image-processing-pipeline, already merged — same situation)
```

If dead, restart similarly (from a **fresh worktree off latest `origin/main`**, not the stale merged ones):
```bash
git worktree add /tmp/dv-html-recovery -b <new-branch> origin/main
cd /tmp/dv-html-recovery && git submodule update --init --recursive
nohup python3 scripts/recover_wayback_content.py --html-only > /tmp/html-recovery.log 2>&1 & disown
```
(swap `--html-only` for `--images-only` for the image side; run in its own worktree). Expect this to be **slow** — archive.org rate-limited heavily this session (~3-5s/file effective rate with retries), much slower than D3's original 30-60min estimate.

To pull whatever these processes have accumulated into a fresh worktree for a new PR: `rsync -a <source-worktree>/content-recovery/staging/{html,images}/ <new-worktree>/content-recovery/staging/{html,images}/`, then re-run `process_images.py`/`convert_posts.py` there.

## Next: D6 — Stale-content triage script

**Issue #6** (unassigned, unblocked — the sole frontier item right now; #7 and #8 are both still blocked behind it). Full spec:

> A script that scans the posts converted by D5 for likely-stale signals — dead-tech keywords (e.g. XBLIG, Windows Phone 8, old Azure Portal UI), broken outbound links, age heuristics — and marks flagged posts `draft: true` with a logged reason. Everything not flagged is left publishable.
>
> Acceptance criteria:
> - Script flags likely-stale posts as `draft: true` with a logged reason
> - Unflagged posts remain publishable (no `draft` flag change)
> - Spot-checked against a handful of manually-identified obviously-stale posts to confirm the heuristics catch known cases without excessive false positives

**Concrete starting points:**
- Read `content/posts/*.md`, parse the TOML front matter (`+++...+++` block) — matches the format `convert_posts.py` already writes (`title`, `date`, `draft`, `author`, `categories`, `tags`).
- Dead-tech keyword list to seed from (all things Dave's blog covers per the recovered content): XBLIG, Xbox Live Indie Games, Windows Phone 7/8, WP8, UDK (Unreal Development Kit, superseded by UE4+), old Azure Portal / classic Azure Portal, Silverlight, XNA (superseded), Windows 8 apps/Metro apps. Cross-check against actual `categories`/`tags` values already present in the converted posts (`git grep -h '^tags = ' content/posts/*.md` and `^categories = ` to see the real vocabulary before picking keywords — don't guess blind).
- Age heuristic: post `date` alone is a weak signal (game-dev/tech posts age at different rates) — better combined with a keyword hit, not used alone as a hard cutoff.
- Broken outbound links: posts contain real external links (Markdown `[text](url)`) — checking these live means HTTP requests to arbitrary third-party domains; reuse the retry/backoff pattern already established in `recover_wayback_content.py`'s `download_with_retry` rather than reinventing it, and rate-limit courteously.
- **A related, already-known signal to fold in or flag separately**: D5's conversion logging reports "External image refs" per post (images hosted on legacy domains D3 never recovered, e.g. `davidvoyles.files.wordpress.com`, Jetpack's Photon CDN) — these are exactly the kind of stale/broken-link candidate D6 is meant to catch. Consider checking these live too (are they still resolving?) as part of the broken-link heuristic, not just outbound text links.
- **Known gap from D5 to be aware of, not D6's job to fix**: the blog used at least two different WordPress themes across its history (`expound`, the one D5's classifier handles, and `enigma-premium`, an older one with completely different HTML markup) — posts only captured under the older theme were silently excluded from D5's conversion entirely (treated as "not a post"). This means the *current* `content/posts/` set is incomplete in a way D6 can't detect (it only sees what already got converted). Worth a note in D6's own report, or a separate follow-up issue, rather than silently assumed-complete.

**Process notes carried over from this session** (same conventions apply):
- Isolate in a fresh `git worktree add /tmp/dv-d6-<name> -b feat/stale-triage origin/main`, `git submodule update --init --recursive` before anything Hugo-related.
- Claim via `gh-axi issue edit 6 --add-assignee DaveVoyles` + a claim comment, per the `orchestrate` skill.
- Self-review gate: route the diff through `~/REPOS/Chat-Agents/scripts/review-lens-route.sh`, dispatch soft lenses (code-quality/testing) as `Explore` subagents + do the `code-review` generalist pass yourself, synthesize via `review-lens-synthesize.sh`, post the receipt via `review-lens-receipt.sh --sha <sha> --repo DaveVoyles/DaveVoylesdotCom`, then land via `~/REPOS/Chat-Agents/scripts/land-pr.sh --pr <N> --repo DaveVoyles/DaveVoylesdotCom`. This repo's App identity + harness lock are confirmed already working (verified live this session) — no extra setup needed.
- Verify a few real posts by hand before trusting the heuristics broadly — this session's lenses caught several real bugs (a Jetpack share-widget leaking into post bodies, a duplicate-publish bug from `:80`-port URL variants, an image-link rewrite risk) that "it ran without errors" alone would have missed. Don't skip independent verification of subagent-reported results.
- Watch the triggered GitHub Actions run after merge (`gh run watch`) and do a real `curl`/live check of the deployed site — don't call it done on a green CI run alone.

## After D6

- **D7** (full site integration & verification) unblocks once D6 lands — needs D1 (done) + D6.
- **D8** (Dave's manual triage review) unblocks once D6 lands too, but it's Dave's own pass, not agent-executable.
- Once both recovery processes finish, someone should do one final full `process_images.py` + `convert_posts.py` pass to pick up whatever's left, before D7's "full site integration" claims completeness.
