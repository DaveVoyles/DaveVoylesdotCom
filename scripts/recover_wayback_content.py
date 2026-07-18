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
BASELINE_NONDATED_POSTS_MIN = 300 - BASELINE_DATED_POSTS  # ~300-450 total unique posts
BASELINE_IMAGES_TOTAL = 2727
BASELINE_IMAGES_PNG = 1280
BASELINE_IMAGES_JPEG = 1232
BASELINE_IMAGES_GIF = 207

# User-Agent header to avoid rejection from archive.org
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

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

    Returns: (html_pages, images)
        where each is a dict: {url: (timestamp, mimetype)}
    """
    if not cdx_data or len(cdx_data) < 2:
        print("[!] No CDX data returned")
        return {}, {}

    # First row is header
    header = cdx_data[0]
    print(f"[*] CDX header: {header}")

    html_pages = {}  # url -> (timestamp, mimetype)
    images = {}      # url -> (timestamp, mimetype)
    raw_count = 0

    for row in cdx_data[1:]:
        raw_count += 1
        timestamp, original, mimetype, statuscode, digest = row[0], row[1], row[2], row[3], row[4]

        # Skip non-200 responses (treat blank as acceptable)
        if statuscode and statuscode != "200":
            continue

        # Categorize by mimetype
        if mimetype == "text/html":
            # Keep latest timestamp for this URL
            if original not in html_pages or timestamp > html_pages[original][0]:
                html_pages[original] = (timestamp, mimetype)
        elif mimetype and mimetype.startswith("image/"):
            # Keep latest timestamp for this URL
            if original not in images or timestamp > images[original][0]:
                images[original] = (timestamp, mimetype)

    print(f"[*] CDX rows processed: {raw_count}")
    print(f"[*] Unique HTML pages (dedup by latest): {len(html_pages)}")
    print(f"[*] Unique images (dedup by latest): {len(images)}")

    return html_pages, images


def categorize_images(images):
    """Categorize images by type (PNG, JPEG, GIF)"""
    png_count = 0
    jpeg_count = 0
    gif_count = 0

    for url, (timestamp, mimetype) in images.items():
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
        except Exception as e:
            print(f"  [!] Error: {e}")
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
    for url, (timestamp, mimetype) in list(html_pages.items())[:limit] if limit else list(html_pages.items()):
        filename = url_to_filename(url) + ".html"
        filepath = HTML_DIR / filename

        if filepath.exists():
            print(f"  [~] {filename} (exists, skipping)")
            html_skipped += 1
            continue

        wayback_url = f"{WAYBACK_BASE}/{timestamp}id_/{url}"
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
    for url, (timestamp, mimetype) in list(images.items())[:limit] if limit else list(images.items()):
        filename = url_to_filename(url) + get_mimetype_extension(mimetype)
        filepath = IMAGE_DIR / filename

        if filepath.exists():
            print(f"  [~] {filename} (exists, skipping)")
            images_skipped += 1
            continue

        wayback_url = f"{WAYBACK_BASE}/{timestamp}id_/{url}"
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

    print("\n" + "="*70)
    print("WAYBACK MACHINE CONTENT RECOVERY SUMMARY")
    print("="*70)

    print(f"\nCDX Query Results (full domain):")
    print(f"  Total unique HTML pages:     {len(html_pages)}")
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
    print(f"  Found {len(html_pages)} unique HTML pages")
    print(f"    Baseline: ~{BASELINE_DATED_POSTS} dated + ~{BASELINE_NONDATED_POSTS_MIN}-{BASELINE_NONDATED_POSTS_MIN + 150} non-dated = ~300-450 unique posts")
    print(f"    Status: {'✓ Within expected range' if BASELINE_DATED_POSTS <= len(html_pages) <= 500 else '⚠ Outside expected range'}")

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
