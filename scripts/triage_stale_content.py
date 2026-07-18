#!/usr/bin/env python3
"""
Stale-content triage script for davevoyles.com

Scans content/posts/*.md (D5's output) for likely-stale signals and marks
flagged posts `draft = true` with a `stale_reason` recorded in the front
matter. Posts already marked `draft = true` are left alone (may be a prior
flag or a deliberate manual override) so re-runs never fight a human's D8
triage decision.

Usage:
    python3 scripts/triage_stale_content.py [--dry-run] [--limit N]
                                             [--skip-link-check] [--link-limit N]

Options:
    --dry-run           Evaluate and report, but don't write changes to files.
    --limit N           Process only the first N posts (for testing).
    --skip-link-check   Skip live outbound-link checking (treat as no broken
                         links found). Useful for fast/offline runs.
    --link-limit N      Cap the number of unique external URLs checked.
"""

import sys
import re
import time
import datetime
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

CONTENT_DIR = Path("content/posts")

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Retry configuration -- same shape as recover_wayback_content.py's
# download_with_retry, applied here to outbound link checks instead of
# archive.org downloads.
MAX_RETRIES = 2
RETRY_DELAY = 1.0  # seconds, doubled on each retry
REQUEST_DELAY = 0.3  # seconds between distinct URL checks
REQUEST_TIMEOUT = 10  # seconds

# A post's date alone is a weak staleness signal (game-dev/tech posts age at
# different rates) -- it only counts combined with a dead-tech keyword hit,
# never as a standalone cutoff.
AGE_THRESHOLD_YEARS = 5

# Dead/EOL tech this blog covers, cross-checked against the real tags/categories
# vocabulary already present in content/posts/*.md (`git grep -h '^tags = '` /
# `'^categories = '`) plus body-text-only mentions (e.g. Silverlight, Azure
# Portal) that don't appear in the front matter at all.
DEAD_TECH_KEYWORDS = [
    "Xbox Live Indie Games",
    "XBLIG",
    "Xbox Live Arcade",
    "XBLA",
    "XNA",
    "Unreal Development Kit",
    "UDK",
    "UnrealScript",
    "Unreal Script",
    "Windows Phone 7",
    "Windows Phone 8",
    "WP8",
    "Windows Phone",
    "Windows 8",
    "Win8",
    "Metro app",
    "Metro apps",
    "SmartGlass",
    "BizSpark",
    "Silverlight",
    "Azure Portal",
]
KEYWORD_PATTERNS = [
    (kw, re.compile(r"\b" + re.escape(kw) + r"\b", re.IGNORECASE))
    for kw in DEAD_TECH_KEYWORDS
]

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp")

FRONT_MATTER_RE = re.compile(r"^\+\+\+\n(.*?)\n\+\+\+\n", re.DOTALL)
# Deliberately preceded-by-"]" rather than trying to distinguish `![alt](url)`
# from `[![alt](url)](url)` (a linked image, this blog's common convention) --
# a hand-rolled regex can't reliably walk that nesting, and both the image URL
# and the outer link URL still start with `](`, so this catches both without
# needing to. The optional `(?:\s+"[^"]*")?` trailing group absorbs a
# Markdown title attribute (`![](url "title")`) -- common on this blog's
# image refs to legacy domains like davidvoyles.files.wordpress.com -- so
# those aren't silently dropped just because they carry a title.
URL_REF_RE = re.compile(r'\]\((https?://[^)\s]+)(?:\s+"[^"]*")?\)')


def load_front_matter_from_text(text):
    """Returns (fm, body, fm_end) for a TOML `+++` front-matter block, or
    None if the text doesn't start with one (e.g. a YAML `---` post like
    D1's hello-world.md placeholder)."""
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return None
    fm, body = m.group(1), text[m.end():]
    return fm, body, m.end()


def load_front_matter(path):
    text = path.read_text(encoding="utf-8")
    loaded = load_front_matter_from_text(text)
    if loaded is None:
        return None
    fm, body, fm_end = loaded
    return text, fm, body, fm_end


def extract_string_field(fm, key):
    m = re.search(rf'^{key} = "((?:[^"\\]|\\.)*)"', fm, re.MULTILINE)
    return m.group(1) if m else None


def extract_list_field(fm, key):
    m = re.search(rf"^{key} = \[(.*?)\]", fm, re.MULTILINE)
    if not m:
        return []
    return re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))


def parse_post_date(date_str):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", date_str or "")
    if not m:
        return None
    y, mo, d = (int(x) for x in m.groups())
    return datetime.date(y, mo, d)


def find_keyword_hits(text):
    return [kw for kw, pattern in KEYWORD_PATTERNS if pattern.search(text)]


def extract_external_urls(body):
    """Returns a deduped, order-preserving list of external (non-davevoyles.com) URLs."""
    seen = []
    for m in URL_REF_RE.finditer(body):
        url = m.group(1)
        host = urllib.parse.urlparse(url).netloc.lower()
        # Legacy self-referential permalinks are a URL-scheme problem (ADR
        # 0003), not a broken-link problem -- out of scope here.
        if host.endswith("davevoyles.com"):
            continue
        if url not in seen:
            seen.append(url)
    return seen


def describe_url(url):
    path = urllib.parse.urlparse(url).path.lower()
    return "image" if path.endswith(IMAGE_EXTENSIONS) else "link"


def check_url(url, max_retries=MAX_RETRIES, timeout=REQUEST_TIMEOUT):
    """Returns (ok, detail). Tries HEAD first, falls back to GET on 405/403."""
    delay = RETRY_DELAY
    for attempt in range(max_retries + 1):
        method = "GET" if attempt > 0 else "HEAD"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.status < 400, str(resp.status)
        except urllib.error.HTTPError as e:
            if e.code == 405 and method == "HEAD":
                # Server doesn't support HEAD -- retry immediately as GET,
                # not a real failure worth backing off for.
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method="GET")
                    with urllib.request.urlopen(req, timeout=timeout) as resp:
                        return resp.status < 400, str(resp.status)
                except urllib.error.HTTPError as e2:
                    return False, f"HTTP {e2.code}"
                except (urllib.error.URLError, OSError) as e2:
                    return False, f"connection error: {e2}"
            if e.code in (429, 500, 502, 503, 504) and attempt < max_retries:
                time.sleep(delay)
                delay *= 2
                continue
            return False, f"HTTP {e.code}"
        except (urllib.error.URLError, OSError) as e:
            if attempt < max_retries:
                time.sleep(delay)
                delay *= 2
                continue
            return False, f"connection error: {e}"
    return False, "max retries exceeded"


def build_link_cache(all_urls, link_limit=None):
    """Checks every unique URL once, rate-limited, and returns {url: (ok, detail)}."""
    urls = sorted(all_urls)
    if link_limit is not None:
        urls = urls[:link_limit]
    cache = {}
    total = len(urls)
    for i, url in enumerate(urls, 1):
        ok, detail = check_url(url)
        cache[url] = (ok, detail)
        status = "OK" if ok else f"BROKEN ({detail})"
        print(f"  [{i}/{total}] {status}: {url}")
        time.sleep(REQUEST_DELAY)
    return cache


TOML_ESCAPES = {"\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t"}
TOML_ESCAPE_RE = re.compile(r'[\\"\n\r\t]')


def toml_string(s):
    return '"' + TOML_ESCAPE_RE.sub(lambda m: TOML_ESCAPES[m.group()], s) + '"'


def apply_flag(text, fm_end, reason):
    """Rewrites `draft = false` -> `draft = true` and inserts `stale_reason`
    right after it, scoped to the front-matter block only."""
    front_matter, rest = text[:fm_end], text[fm_end:]
    new_front_matter, count = re.subn(
        r"^draft = false$",
        "draft = true\nstale_reason = " + toml_string(reason),
        front_matter,
        count=1,
        flags=re.MULTILINE,
    )
    if count != 1:
        raise ValueError("could not find `draft = false` in front matter")
    return new_front_matter + rest


def evaluate_post(fm, body, link_cache):
    """Returns (reasons: list[str], detail: dict) -- empty reasons means unflagged."""
    title = extract_string_field(fm, "title") or ""
    categories = extract_list_field(fm, "categories")
    tags = extract_list_field(fm, "tags")
    date_str = extract_string_field(fm, "date")

    searchable = " ".join([title, *categories, *tags, body])
    keyword_hits = find_keyword_hits(searchable)

    post_date = parse_post_date(date_str)
    age_years = (
        (datetime.date.today() - post_date).days / 365.25 if post_date else None
    )

    reasons = []
    if keyword_hits and age_years is not None and age_years >= AGE_THRESHOLD_YEARS:
        reasons.append(
            f"dead-tech keywords ({', '.join(keyword_hits)}); {age_years:.1f} years old"
        )

    broken = []
    for url in extract_external_urls(body):
        ok, detail = link_cache.get(url, (True, "not checked"))
        if not ok:
            broken.append((url, detail))
    if broken:
        shown = "; ".join(f"{describe_url(u)} {u} ({d})" for u, d in broken[:5])
        more = f" (+{len(broken) - 5} more)" if len(broken) > 5 else ""
        reasons.append(f"broken outbound reference(s): {shown}{more}")

    return reasons, {
        "keyword_hits": keyword_hits,
        "age_years": age_years,
        "broken_links": broken,
    }


def iter_candidate_files(limit=None):
    files = sorted(CONTENT_DIR.glob("*.md"))
    return files[:limit] if limit is not None else files


def main():
    dry_run = False
    limit = None
    skip_link_check = False
    link_limit = None

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "--dry-run":
            dry_run = True
            i += 1
        elif arg == "--skip-link-check":
            skip_link_check = True
            i += 1
        elif arg == "--limit":
            if i + 1 >= len(args):
                print("[!] --limit requires a value")
                sys.exit(1)
            limit = int(args[i + 1])
            i += 2
        elif arg == "--link-limit":
            if i + 1 >= len(args):
                print("[!] --link-limit requires a value")
                sys.exit(1)
            link_limit = int(args[i + 1])
            i += 2
        else:
            print(f"[!] Unrecognized argument: {arg!r}")
            print(__doc__)
            sys.exit(1)

    files = iter_candidate_files(limit)
    posts = []  # (path, text, fm, body, fm_end)
    already_draft = 0
    for path in files:
        loaded = load_front_matter(path)
        if loaded is None:
            print(f"  [!] {path.name}: no front matter, skipping")
            continue
        text, fm, body, fm_end = loaded
        draft_match = re.search(r"^draft = (true|false)$", fm, re.MULTILINE)
        if draft_match is None:
            print(f"  [!] {path.name}: no `draft` field, skipping")
            continue
        if draft_match.group(1) == "true":
            # Already flagged (by us or manually) -- a prior D6 run or a D8
            # manual override. Re-running never fights that decision.
            already_draft += 1
            continue
        posts.append((path, text, fm, body, fm_end))

    print(f"Candidate posts (draft = false): {len(posts)}  (already draft = true: {already_draft})")

    if skip_link_check:
        print("Skipping live link check (--skip-link-check)")
        link_cache = {}
    else:
        all_urls = set()
        for _, _, _, body, _ in posts:
            all_urls.update(extract_external_urls(body))
        print(f"Checking {len(all_urls)} unique external URL(s) (rate-limited, ~{REQUEST_DELAY}s apart)...")
        link_cache = build_link_cache(all_urls, link_limit=link_limit)

    flagged, unflagged = [], []
    for path, text, fm, body, fm_end in posts:
        reasons, detail = evaluate_post(fm, body, link_cache)
        if reasons:
            reason = "; ".join(reasons)
            flagged.append((path, reason))
            if not dry_run:
                new_text = apply_flag(text, fm_end, reason)
                path.write_text(new_text, encoding="utf-8")
        else:
            unflagged.append(path)

    print("\n" + "=" * 70)
    print("STALE-CONTENT TRIAGE SUMMARY")
    print("=" * 70)
    print(f"  Evaluated:                 {len(posts)}" + (" (dry run, not written)" if dry_run else ""))
    print(f"  Flagged (draft = true):    {len(flagged)}")
    for path, reason in flagged:
        print(f"    - {path.name}: {reason}")
    print(f"  Left publishable:          {len(unflagged)}")
    print(f"  Already draft = true:      {already_draft} (untouched -- prior flag or manual override)")
    if not skip_link_check:
        broken_count = sum(1 for ok, _ in link_cache.values() if not ok)
        print(f"  External URLs checked:     {len(link_cache)} ({broken_count} broken)")
    print("-" * 70)
    print(
        "  Known gap (not this script's job to fix): D5's classifier only "
        "handles the `expound` WordPress theme. Posts captured under an "
        "older theme (`enigma-premium`) were silently excluded from "
        "content/posts/ entirely -- this triage pass only sees what already "
        "got converted, so it cannot flag or count anything from that gap. "
        "See HANDOFF.md / D5 PR #16 discussion."
    )
    print("=" * 70)


if __name__ == "__main__":
    main()
