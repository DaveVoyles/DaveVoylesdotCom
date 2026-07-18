#!/usr/bin/env python3
"""
Wayback Machine content recovery script for davevoyles.com

Queries the Wayback CDX API to find and download all archived HTML pages and
images, with deduplication by latest capture per unique URL.

Usage:
    python3 scripts/recover_wayback_content.py [--limit N] [--dry-run]

Options:
    --limit N       Cap downloads to N HTML pages and N images (default: no limit)
    --dry-run       Query CDX but skip downloads; report counts only
"""

import sys
import os
import urllib.request
import urllib.error
import json
import time
import re
from pathlib import Path
from urllib.parse import urlparse, quote

# Configuration
TARGET_DOMAIN = "davevoyles.com"
CDX_API_URL = "https://web.archive.org/cdx/search/cdx"
WAYBACK_BASE = "https://web.archive.org/web"
STAGING_DIR = Path("content-recovery/staging")
HTML_DIR = STAGING_DIR / "html"
IMAGE_DIR = STAGING_DIR / "images"

# Baseline figures from the design doc and issue
BASELINE_DATED_POSTS = 260
BASELINE_IMAGES_TOTAL = 2727
BASELINE_IMAGES_PNG = 1280
BASELINE_IMAGES_JPEG = 1232
BASELINE_IMAGES_GIF = 207

# User-Agent header to avoid rejection from archive.org
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# The one concretely-known post URL shape from the design doc: /YYYY/MM/DD/slug/
DATED_POST_RE = re.compile(r'^https?://(?:www\.)?davevoyles\.com/\d{4}/\d{2}/\d{2}/[^/]+/?$')


def normalize_url_key(url):
    """Scheme/www/trailing-slash-normalized key so http and https captures of the
    same page collapse to one dedup entry instead of being counted twice."""
    key = re.sub(r'^https?://', '', url, flags=re.IGNORECASE).lower()
    if key.startswith('www.'):
        key = key[4:]
    return key.rstrip('/')

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 0.5  # seconds, doubled on each retry
REQUEST_DELAY = 0.3  # seconds between requests


def get_cdx_data():
    """Query the Wayback CDX API for all captures of davevoyles.com"""
    params = {
        "url": TARGET_DOMAIN,
        "matchType": "domain",
        "output": "json",
        "fl": "timestamp,original,mimetype,statuscode,digest",
        "collapse": "digest",
        "limit": "100000"
    }

    query_string = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    url = f"{CDX_API_URL}?{query_string}"

    print(f"[*] Querying CDX API: {url[:80]}...")

    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.URLError as e:
        print(f"[!] Failed to query CDX API: {e}")
        sys.exit(1)


def parse_cdx_data(cdx_data):
    """
    Parse CDX JSON and deduplicate by latest timestamp per URL.

    Dedup key is scheme/www/trailing-slash-normalized (davevoyles.com serves the same
    post at http:// and https:// and with/without "www.", and the Wayback Machine
    archived both as distinct captures — without normalizing, every post gets counted
    twice). The dict value keeps the real fetchable URL (with scheme) alongside it.

    Returns: (html_pages, images)
        where each is a dict: {normalized_key: (timestamp, mimetype, original_url)}
    """
    if not cdx_data or len(cdx_data) < 2:
        print("[!] No CDX data returned")
        return {}, {}

    # First row is header
    header = cdx_data[0]
    print(f"[*] CDX header: {header}")

    html_pages = {}  # normalized_key -> (timestamp, mimetype, original_url)
    images = {}      # normalized_key -> (timestamp, mimetype, original_url)
    raw_count = 0

    for row in cdx_data[1:]:
        raw_count += 1
        timestamp, original, mimetype, statuscode, digest = row[0], row[1], row[2], row[3], row[4]

        # Skip non-200 responses (treat blank as acceptable)
        if statuscode and statuscode != "200":
            continue

        key = normalize_url_key(original)

        # Categorize by mimetype
        if mimetype == "text/html":
            # Keep latest timestamp for this URL
            if key not in html_pages or timestamp > html_pages[key][0]:
                html_pages[key] = (timestamp, mimetype, original)
        elif mimetype and mimetype.startswith("image/"):
            # Keep latest timestamp for this URL
            if key not in images or timestamp > images[key][0]:
                images[key] = (timestamp, mimetype, original)

    print(f"[*] CDX rows processed: {raw_count}")
    print(f"[*] Unique HTML pages (dedup by latest, scheme/www-normalized): {len(html_pages)}")
    print(f"[*] Unique images (dedup by latest, scheme/www-normalized): {len(images)}")

    return html_pages, images


def classify_post_pages(html_pages):
    """
    Split html_pages into dated-permalink posts (matching the one concretely-known
    post URL shape, /YYYY/MM/DD/slug/) vs everything else (feeds, embeds, category/tag
    archives, admin pages, non-dated posts, etc). This is what makes the "post-page
    count" comparable to the design doc's ~260 dated-post baseline — the un-split total
    also includes large amounts of non-post noise and isn't directly comparable.

    Non-dated posts remain mixed into "other" here on purpose: distinguishing them from
    non-post noise needs content-based classification, which is D5/D6's job, not D3's.
    """
    dated_posts = {}
    other_pages = {}
    for key, value in html_pages.items():
        _, _, original = value
        if DATED_POST_RE.match(original):
            dated_posts[key] = value
        else:
            other_pages[key] = value
    return dated_posts, other_pages


def categorize_images(images):
    """Categorize images by type (PNG, JPEG, GIF)"""
    png_count = 0
    jpeg_count = 0
    gif_count = 0

    for key, (timestamp, mimetype, original) in images.items():
        if "png" in mimetype.lower():
            png_count += 1
        elif "jpeg" in mimetype.lower() or "jpg" in mimetype.lower():
            jpeg_count += 1
        elif "gif" in mimetype.lower():
            gif_count += 1

    return png_count, jpeg_count, gif_count


def url_to_filename(url):
    """Convert a URL to a filesystem-safe filename"""
    # Remove protocol
    if "://" in url:
        url = url.split("://", 1)[1]

    # Remove davevoyles.com prefix
    if url.startswith(TARGET_DOMAIN):
        url = url[len(TARGET_DOMAIN):]

    # Replace forward slashes with underscores
    filename = url.replace("/", "_")

    # Remove leading underscore if present
    if filename.startswith("_"):
        filename = filename[1:]

    # Clean up query strings and fragments
    filename = re.sub(r'[?#].*$', '', filename)

    # Remove any remaining problematic characters
    filename = re.sub(r'[<>:"|?*]', '', filename)

    return filename or "index"


def get_mimetype_extension(mimetype):
    """Get file extension from mimetype"""
    ext_map = {
        "text/html": ".html",
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/gif": ".gif",
    }
    return ext_map.get(mimetype, "")


def download_with_retry(url, max_retries=MAX_RETRIES):
    """
    Download content from archive.org with exponential backoff retry.
    Returns (content, success) tuple.
    """
    delay = RETRY_DELAY

    for attempt in range(max_retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=15) as response:
                content = response.read()
                return content, True
        except urllib.error.HTTPError as e:
            # Retry on 429 (rate limit) or 5xx errors
            if e.code in (429, 500, 502, 503, 504):
                if attempt < max_retries:
                    print(f"  [!] HTTP {e.code}, retrying in {delay}s...")
                    time.sleep(delay)
                    delay *= 2
                    continue
            else:
                print(f"  [!] HTTP {e.code} (not retrying)")
                return None, False
        except (urllib.error.URLError, OSError) as e:
            # Connection-level failures (refused, reset, DNS, timeout) — transient on a
            # long unattended run against a third-party server, worth retrying just like
            # HTTP 5xx rather than failing the item outright on one bad connection.
            if attempt < max_retries:
                print(f"  [!] Connection error ({e}), retrying in {delay}s...")
                time.sleep(delay)
                delay *= 2
                continue
            else:
                print(f"  [!] Connection error (max retries exceeded): {e}")
                return None, False

    print(f"  [!] Max retries exceeded")
    return None, False


def download_items(html_pages, images, limit=None, dry_run=False):
    """
    Download HTML pages and images. If limit is set, cap downloads.
    Returns (html_downloaded, html_skipped, images_downloaded, images_skipped).
    """
    html_downloaded = 0
    html_skipped = 0
    images_downloaded = 0
    images_skipped = 0

    if dry_run:
        print("[*] DRY RUN: skipping downloads")
        return 0, len(html_pages), 0, len(images)

    # Ensure directories exist
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    # Download HTML pages
    print(f"\n[*] Downloading HTML pages...")
    for key, (timestamp, mimetype, original) in list(html_pages.items())[:limit] if limit else list(html_pages.items()):
        filename = url_to_filename(original) + ".html"
        filepath = HTML_DIR / filename

        if filepath.exists():
            print(f"  [~] {filename} (exists, skipping)")
            html_skipped += 1
            continue

        wayback_url = f"{WAYBACK_BASE}/{timestamp}id_/{original}"
        print(f"  [>] {filename}...", end="", flush=True)

        content, success = download_with_retry(wayback_url)
        if success:
            try:
                filepath.write_bytes(content)
                print(" OK")
                html_downloaded += 1
            except Exception as e:
                print(f" SAVE_ERROR: {e}")
        else:
            print(" FAILED")

        time.sleep(REQUEST_DELAY)

    # Cap remaining HTML pages as skipped if limit was applied
    if limit and len(html_pages) > limit:
        html_skipped += len(html_pages) - limit

    # Download images
    print(f"\n[*] Downloading images...")
    for key, (timestamp, mimetype, original) in list(images.items())[:limit] if limit else list(images.items()):
        filename = url_to_filename(original) + get_mimetype_extension(mimetype)
        filepath = IMAGE_DIR / filename

        if filepath.exists():
            print(f"  [~] {filename} (exists, skipping)")
            images_skipped += 1
            continue

        wayback_url = f"{WAYBACK_BASE}/{timestamp}id_/{original}"
        print(f"  [>] {filename}...", end="", flush=True)

        content, success = download_with_retry(wayback_url)
        if success:
            try:
                filepath.write_bytes(content)
                print(" OK")
                images_downloaded += 1
            except Exception as e:
                print(f" SAVE_ERROR: {e}")
        else:
            print(" FAILED")

        time.sleep(REQUEST_DELAY)

    # Cap remaining images as skipped if limit was applied
    if limit and len(images) > limit:
        images_skipped += len(images) - limit

    return html_downloaded, html_skipped, images_downloaded, images_skipped


def print_summary(html_pages, images, html_downloaded, html_skipped, images_downloaded, images_skipped):
    """Print a summary of recovery results"""
    png_count, jpeg_count, gif_count = categorize_images(images)
    dated_posts, other_pages = classify_post_pages(html_pages)

    print("\n" + "="*70)
    print("WAYBACK MACHINE CONTENT RECOVERY SUMMARY")
    print("="*70)

    print(f"\nCDX Query Results (full domain):")
    print(f"  Total unique HTML pages:     {len(html_pages)}")
    print(f"    └─ Dated posts (/YYYY/MM/DD/slug/): {len(dated_posts)}")
    print(f"    └─ Other (feeds/embeds/archives/non-dated/etc): {len(other_pages)}")
    print(f"  Total unique images:         {len(images)}")
    print(f"    └─ PNG:                    {png_count}")
    print(f"    └─ JPEG:                   {jpeg_count}")
    print(f"    └─ GIF:                    {gif_count}")

    print(f"\nDownload Summary (this run):")
    print(f"  HTML pages downloaded:       {html_downloaded}")
    print(f"  HTML pages skipped (exist):  {html_skipped}")
    print(f"  Images downloaded:           {images_downloaded}")
    print(f"  Images skipped (exist):      {images_skipped}")

    print(f"\nBaseline Comparison:")
    print(f"  Found {len(dated_posts)} dated-permalink posts (the one concretely-known post URL shape)")
    print(f"    Baseline: ~{BASELINE_DATED_POSTS} dated posts")
    print(f"    Status: {'✓ Within expected range (±20%)' if 0.8 * BASELINE_DATED_POSTS <= len(dated_posts) <= 1.2 * BASELINE_DATED_POSTS else '⚠ Outside expected range'}")
    print(f"  Found {len(other_pages)} other HTML captures (not directly comparable to a baseline —")
    print(f"    this bucket mixes real non-dated posts with feeds/embeds/archives/admin pages;")
    print(f"    content-based post/non-post classification is D5/D6's job, not D3's)")
    print(f"  Combined total ({len(html_pages)}) is NOT expected to match the ~300-450 unique-post")
    print(f"    estimate directly — that estimate is unique POSTS, this total is unique CAPTURES")
    print(f"    of every HTML page type on the domain (categories, tags, author pages, feeds, etc).")

    print(f"\n  Found {len(images)} unique images")
    print(f"    Breakdown: {png_count} PNG + {jpeg_count} JPEG + {gif_count} GIF")
    print(f"    Baseline: {BASELINE_IMAGES_TOTAL} total ({BASELINE_IMAGES_PNG} PNG + {BASELINE_IMAGES_JPEG} JPEG + {BASELINE_IMAGES_GIF} GIF)")
    print(f"    Status: {'✓ Close to baseline' if abs(len(images) - BASELINE_IMAGES_TOTAL) <= 100 else '⚠ Discrepancy noted'}")

    print("\n" + "="*70)


def main():
    # Parse command-line arguments
    limit = None
    dry_run = False

    for arg in sys.argv[1:]:
        if arg == "--dry-run":
            dry_run = True
        elif arg.startswith("--limit"):
            try:
                limit = int(arg.split("=")[1] if "=" in arg else sys.argv[sys.argv.index(arg) + 1])
            except (ValueError, IndexError):
                print("[!] Invalid --limit argument")
                sys.exit(1)

    print(f"Wayback Machine Content Recovery Script")
    print(f"Target: {TARGET_DOMAIN}")
    if limit:
        print(f"Limit: {limit} items per category")
    if dry_run:
        print(f"Mode: DRY RUN")
    print()

    # Query CDX
    cdx_data = get_cdx_data()
    html_pages, images = parse_cdx_data(cdx_data)

    # Download
    html_dl, html_skip, img_dl, img_skip = download_items(html_pages, images, limit=limit, dry_run=dry_run)

    # Print summary
    print_summary(html_pages, images, html_dl, html_skip, img_dl, img_skip)


if __name__ == "__main__":
    main()
