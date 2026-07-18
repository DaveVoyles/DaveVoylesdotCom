# Scripts

This directory contains utility scripts for the davevoyles.com rebuild project.

## recover_wayback_content.py

A Python 3 script that recovers archived HTML pages and images for davevoyles.com from the Wayback Machine.

### Usage

```bash
python3 scripts/recover_wayback_content.py [--limit N] [--dry-run]
```

### Options

- `--limit N` — Cap downloads to N HTML pages and N images. Useful for testing/verification. Default: no limit (downloads all).
- `--dry-run` — Query the CDX API and report counts, but skip actual file downloads.
- `--images-only` / `--html-only` — Download only one category. CDX counts/baseline
  comparison always run on the full set regardless; only the download step is
  scoped down. Useful when a downstream consumer only needs one category (e.g.
  D4's image pipeline doesn't need the ~5,500 HTML pages) and shouldn't be stuck
  waiting behind an unrelated download queue.

### Examples

```bash
# Quick verification run: fetch CDX index and download first 15 HTML pages + 15 images
python3 scripts/recover_wayback_content.py --limit 15

# Dry run: see the counts without downloading anything
python3 scripts/recover_wayback_content.py --dry-run

# Full recovery (WARNING: ~3000 files, takes minutes to hours)
python3 scripts/recover_wayback_content.py
```

### What It Does

1. **Queries the Wayback CDX API** for all captures of `davevoyles.com` (`matchType=domain`)
2. **Deduplicates** by keeping only the latest capture per unique URL (important: the baseline figures of ~260 dated posts, several hundred non-dated posts, and 2,727 images in the design doc are unique-URL counts, not raw capture counts)
3. **Filters** for HTTP 200 responses (or blank statuscode) and categorizes:
   - **HTML pages**: `mimetype: text/html`
   - **Images**: `mimetype: image/*` (PNG, JPEG, GIF)
4. **Downloads** each item from the Wayback snapshot URL using the `id_` modifier (returns raw unmodified content)
5. **Saves** outputs to:
   - HTML pages: `content-recovery/staging/html/`
   - Images: `content-recovery/staging/images/`
6. **Resumes gracefully**: skips files that already exist on disk (idempotent)
7. **Retries** on HTTP 429 (rate limit) and 5xx errors with exponential backoff
8. **Prints a summary** comparing recovered counts against baseline figures

### Performance Notes

- **Verification runs** (`--limit 15` or `--limit 50`) take seconds to minutes and are safe to run interactively
- **Full recovery runs** download ~3000 files and take **minutes to hours** depending on network speed and Wayback load
  - Plan for at least 30-60 minutes
  - Best run separately from CI or other network-intensive tasks
  - Add delays between requests (0.3s hardcoded) to be a good citizen of archive.org servers

### Output

The script prints:
- CDX query details
- Download progress for each file
- A summary report with:
  - Total unique HTML pages and images found (post-deduplication)
  - Breakdown of image types (PNG/JPEG/GIF)
  - How many items were downloaded vs. skipped in this run
  - Comparison against the ~260 dated posts, several hundred non-dated posts, and 2,727-image baseline

### Staging Directory

Downloaded files are placed in `content-recovery/staging/` which is **not committed to git** (see `.gitignore`). These are intermediate artifacts for the next pipeline step (D4 image processing, D5 HTML→Markdown conversion).

## process_images.py

Resizes/compresses images from `content-recovery/staging/images/` (D3's output)
and places them under `static/images/` — Hugo's static assets, committed
directly to the repo per [ADR 0002](../docs/decisions/0002-images-committed-to-repo.md)
(no LFS, no hotlinking).

### Setup (one-time)

Requires Pillow, which is intentionally NOT installed into the system/Homebrew
Python (that's reserved stdlib-only per `recover_wayback_content.py`'s
convention) — use a dedicated venv instead:

```bash
python3 -m venv scripts/.venv
scripts/.venv/bin/pip install Pillow
```

### Usage

```bash
scripts/.venv/bin/python3 scripts/process_images.py [--limit N] [--dry-run]
```

### What It Does

1. Resizes each image so its longest edge is at most 1600px (never upscales —
   images already smaller than that are left alone)
2. Compresses: JPEG at quality 82 (optimized, progressive), PNG with
   optimization, animated GIFs frame-by-frame (preserving duration/loop)
3. SVG and other non-rasterizable files D3's broad `image/*` CDX filter picked
   up (icon-font SVGs, etc.) are copied through unchanged — Pillow can't
   process vector formats, and they're typically tiny already
4. Skips files already processed (idempotent/resumable, same as D3's script)
5. Logs before/after total size and a reduction percentage

### Note on completeness

`content-recovery/staging/images/` fills in over time as D3's recovery script
(run with `--images-only`) continues downloading — re-running
`process_images.py` picks up newly-arrived images and skips ones already
processed. `static/images/` in this repo may not yet contain the full
recovered set; each run's summary output states exactly how many were found
vs. processed vs. already done.

## convert_posts.py

Converts recovered post HTML (`content-recovery/staging/html/`, D3's output)
into Hugo content files under `content/posts/`, per
[ADR 0003](../docs/decisions/0003-clean-url-scheme-not-preserving-legacy-permalinks.md)
(Hugo's default clean URL scheme, not the old WordPress permalinks).

### Setup

Uses the same shared venv as `process_images.py` (`scripts/.venv`), plus
`beautifulsoup4` and `markdownify`:

```bash
scripts/.venv/bin/pip install beautifulsoup4 markdownify
```

### Usage

```bash
scripts/.venv/bin/python3 scripts/convert_posts.py [--limit N] [--dry-run]
```

### What It Does

1. **Classifies** each recovered HTML capture as a real post or not. D3's CDX
   filter recovers everything from feeds and category archives to WordPress
   attachment pages (auto-generated per-image pages that share a dated
   permalink and entry-title/entry-content/entry-date markup with real
   posts) — a page only counts as a real post if it has substantive body
   text (200+ characters) and no image-navigation nav (the attachment-page
   tell). Known non-post URL patterns (feeds, embeds, tag/category/author
   archives, pagination, trackbacks) are filtered out by filename first.
2. **Extracts** title, date (preferring the page's own `<time>`/`.entry-date`
   markup over the URL's date, since not all posts are at dated permalinks),
   author, categories, and tags from the actual WordPress theme markup.
3. **Cleans** the body of a social-follow signature block (Twitter/Twitch/
   YouTube links, an embedded MailChimp newsletter form) that many posts have
   appended after the real content — identified by truncating at the first
   stable marker rather than trying to match every variant of this
   inconsistently-malformed boilerplate.
4. **Rewrites** `<img src>` (and any enclosing `<a href>` linking to the same
   full-size image) to D4's `static/images/` output path, using D3's own
   `url_to_filename()` so references resolve to whatever D4 actually wrote.
   Images from other/legacy domains (the blog's pre-davevoyles.com WordPress.com
   hosting, Jetpack's Photon CDN proxy) are out of D3's recovery scope and are
   left as external links — a known long-tail limitation, not a bug.
5. **Normalizes slugs** so the same post captured under URL variants D3's
   dedup treats as distinct (e.g. an explicit `:80` port in the historical
   URL) collapses to one file; a genuine duplicate is skipped and logged as
   a collision rather than silently publishing the same post twice.
6. **Logs** candidate/converted/excluded/collision/failed counts and how many
   image references couldn't yet be resolved (recovery may still be running).

### Note on completeness

Same pattern as the other two scripts: candidate HTML pages fill in over time
as D3's `--html-only` recovery continues, and `content/posts/` in this repo
may not yet reflect the full recovered set. Run `hugo build` after any
re-run to confirm the full current content set still builds cleanly.

## triage_stale_content.py

Scans `content/posts/*.md` (D5's output) for likely-stale signals and marks
flagged posts `draft = true` with a `stale_reason` recorded right in the
front matter, so the reason travels with the post for
[D8](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/8)'s manual
review pass. Pure stdlib -- no venv required.

### Usage

```bash
python3 scripts/triage_stale_content.py [--dry-run] [--limit N] \
    [--skip-link-check] [--link-limit N]
```

- `--dry-run` — evaluate and report, but don't write changes to files.
- `--limit N` — process only the first N posts (for testing).
- `--skip-link-check` — skip live outbound-link checking (treat as no broken
  links found). Useful for fast/offline runs.
- `--link-limit N` — cap the number of unique external URLs checked.

### What It Does

1. **Dead-tech keywords** — matches a seeded list of EOL/deprecated
   technology this blog covers (XBLIG, XNA, UDK, UnrealScript, Windows
   Phone, Windows 8, SmartGlass, BizSpark, Silverlight, classic Azure
   Portal, ...) against each post's title, categories, tags, and body text.
2. **Age heuristic** — a post's date alone is a weak signal (game-dev/tech
   posts age at different rates), so it's only used combined with a
   keyword hit (posts older than `AGE_THRESHOLD_YEARS`), never as a
   standalone cutoff.
3. **Broken outbound links** — extracts every external (non-davevoyles.com)
   URL referenced in a post's body, including image references D5 couldn't
   resolve to a local `static/images/` path (hosted on legacy domains like
   `davevoyles.azurewebsites.net`), deduplicates across the whole corpus,
   and checks each once with the same retry/backoff shape as
   `recover_wayback_content.py`'s `download_with_retry`, rate-limited to be
   a good citizen of third-party servers. A post with any broken reference
   is flagged regardless of age.
4. **Flags** by rewriting `draft = false` -> `draft = true` and inserting a
   `stale_reason = "..."` line in the front matter. Posts already
   `draft = true` (a prior D6 run, or a manual D8 override) are left
   untouched — re-running never fights a human decision.
5. **Logs** a summary to stdout: evaluated/flagged/unflagged counts, each
   flagged post with its reason, and how many external URLs were checked
   and found broken.

### Known gap (documented, not fixed here)

D5's HTML->Markdown classifier only handles the blog's `expound` WordPress
theme. Posts captured under an older theme (`enigma-premium`) were silently
excluded from `content/posts/` entirely, so this triage pass — like D5 —
only sees what already got converted and can't flag or count anything from
that gap.
