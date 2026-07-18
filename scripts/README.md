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
