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
