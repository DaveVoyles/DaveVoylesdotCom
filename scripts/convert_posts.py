#!/usr/bin/env python3
"""
HTML -> Hugo Markdown conversion script for davevoyles.com (D5).

Converts recovered post HTML (D3's content-recovery/staging/html/) into Hugo
content files under content/posts/, rewriting internal image references to
D4's static/images/ output paths and using Hugo's default clean URL scheme
(/posts/<slug>/), per ADR 0003 -- old WordPress permalinks are explicitly
not preserved.

Requires beautifulsoup4 + markdownify in the dedicated venv (scripts/.venv,
same one D4 uses for Pillow) -- see scripts/README.md.

Usage:
    scripts/.venv/bin/python3 scripts/convert_posts.py [--limit N] [--dry-run]

Options:
    --limit N   Convert only the first N candidate posts
    --dry-run   Report what would be converted without writing any files
"""

import sys
import re
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup, NavigableString
from markdownify import markdownify as md

# Reuse D3's exact filename convention so image references resolve to
# whatever D4 actually produced under static/images/.
sys.path.insert(0, str(Path(__file__).parent))
from recover_wayback_content import url_to_filename  # noqa: E402

STAGING_HTML_DIR = Path("content-recovery/staging/html")
OUTPUT_CONTENT_DIR = Path("content/posts")
STATIC_IMAGES_DIR = Path("static/images")

TARGET_DOMAIN = "davevoyles.com"

# Filename substrings that mark a capture as definitely not a real post
# (WordPress feeds/embeds/archives/admin endpoints, not authored content).
EXCLUDE_SUBSTRINGS = (
    "_feed_", "_embed_", "_tag_", "_category_", "_author_", "_page_",
    "comment-page-", "trackback", "xmlrpc", "wp-json", "wp-login",
    "wp-admin", "_wp-content_",
)

# The one concretely-known dated permalink shape, applied to the sanitized
# filename stem (www.davevoyles.com_YYYY_MM_DD_slug_ -> date + slug).
DATED_FILENAME_RE = re.compile(r'^(\d{4})_(\d{2})_(\d{2})_(.+)$')

MONTH_DATE_RE = re.compile(r'^[A-Za-z]+ \d{1,2}, \d{4}$')

AUTHOR_NORMALIZATIONS = {
    "davevoyles": "Dave Voyles",
    "dave voyles": "Dave Voyles",
    "davidvoyles": "Dave Voyles",
    "david voyles": "Dave Voyles",
}


def iter_candidate_files(limit=None):
    if not STAGING_HTML_DIR.is_dir():
        print(f"[!] {STAGING_HTML_DIR} does not exist -- run recover_wayback_content.py first")
        sys.exit(1)
    files = sorted(p for p in STAGING_HTML_DIR.iterdir() if p.is_file() and p.suffix == ".html")
    candidates = [p for p in files if not any(s in p.name for s in EXCLUDE_SUBSTRINGS)]
    return candidates[:limit] if limit else candidates


# Some CDX captures embed an explicit port in the URL (e.g. the historical
# http://www.davevoyles.com:80/slug/), which D3's dedup treats as a distinct
# URL from the portless version -- both get downloaded, but they're the same
# post. Stripping an optional numeric port suffix here means both variants
# produce the SAME slug, so the existing collision check (dst.exists())
# naturally skips the duplicate instead of silently publishing both.
HOST_PREFIX_RE = re.compile(r'^(?:www\.)?' + re.escape(TARGET_DOMAIN) + r'\d*_')


def extract_slug_and_filename_date(stem):
    """stem is the filename without '.html', e.g.
    'www.davevoyles.com_2011_06_23_death-sentence-website-is-live_'.
    Returns (slug, (year, month, day) or None)."""
    s = HOST_PREFIX_RE.sub("", stem, count=1)
    s = s.rstrip("_")
    if not s:
        return None, None

    m = DATED_FILENAME_RE.match(s)
    if m:
        year, month, day, slug = m.groups()
        return slug, (int(year), int(month), int(day))
    return s, None


def parse_date(soup, filename_date):
    """Prefer the page's own date markup (more authoritative); fall back to
    the dated-permalink filename; fall back to None (excluded by caller)."""
    time_el = soup.select_one("time.entry-date[datetime]")
    if time_el and time_el.get("datetime"):
        try:
            return datetime.fromisoformat(time_el["datetime"])
        except ValueError:
            pass

    date_el = soup.select_one(".entry-date")
    if date_el:
        text = date_el.get_text(strip=True)
        if MONTH_DATE_RE.match(text):
            try:
                return datetime.strptime(text, "%B %d, %Y")
            except ValueError:
                pass

    if filename_date:
        year, month, day = filename_date
        return datetime(year, month, day)

    return None


def parse_author(soup):
    author_el = soup.select_one("a.author, .author")
    if author_el:
        text = author_el.get_text(strip=True)
        return AUTHOR_NORMALIZATIONS.get(text.lower(), text)
    return "Dave Voyles"


def parse_terms(soup):
    """Categories and tags both render as <a rel="..."> links; bs4 splits
    the space-separated rel attribute into a list, so a category link's
    rel is ['category', 'tag'] and a tag-only link's rel is just ['tag'].

    Scoped to footer.entry-meta (where these actually live -- confirmed
    live against real posts) rather than the whole page: a sidebar
    category-cloud/tag-cloud widget using the same rel convention for the
    WHOLE SITE's terms, not just this post's, would otherwise pollute
    every post with unrelated categories/tags. Not observed in this theme
    (no outlier tag counts across the current converted set), but scoping
    defensively costs nothing and removes the risk for posts from a
    different theme era."""
    scope = soup.select_one("footer.entry-meta") or soup
    categories, tags = [], []
    for a in scope.find_all("a", rel=True):
        rel = a.get("rel") or []
        text = a.get_text(strip=True)
        if not text:
            continue
        if "category" in rel and text not in categories:
            categories.append(text)
        elif "tag" in rel and text not in tags:
            tags.append(text)
    return categories, tags


def _resolve_image_path(url):
    """D4's output path for a davevoyles.com image URL, using D3's exact
    url_to_filename() so it resolves to whatever D4 actually wrote."""
    ext = Path(url.split("?")[0]).suffix or ".jpg"
    filename = f"{url_to_filename(url)}{ext}"
    return f"/images/{filename}", (STATIC_IMAGES_DIR / filename).exists()


def rewrite_images(content_soup):
    """Rewrite <img src> to D4's static/images/ output path. An enclosing
    <a href> is resolved independently rather than copying the img's new
    path onto it -- WordPress commonly wraps a resized thumbnail <img> in
    an <a> linking to the full-size original, a DIFFERENT file than the
    thumbnail, so the two need their own D4-resolved paths, not one shared
    path forced onto both.

    Returns (unresolved, external): "unresolved" is a davevoyles.com image
    D3/D4 should eventually have but doesn't yet (recovery may still be
    running -- this count will reach zero). "external" is a DIFFERENT kind
    of gap that will NEVER resolve via D4: images hosted on legacy domains
    (the blog's pre-davevoyles.com WordPress.com hosting, Jetpack's Photon
    CDN proxy) are out of D3's recovery scope entirely and are left as
    external hotlinks. Reporting only "unresolved" and implying 0 means
    "all images working" would be misleading -- most images on this site's
    older posts are external and this makes that visible instead of silent."""
    unresolved, external = [], []
    for img in content_soup.find_all("img"):
        src = img.get("src")
        if src:
            if TARGET_DOMAIN in src:
                new_path, exists = _resolve_image_path(src)
                img["src"] = new_path
                if not exists:
                    unresolved.append(src)
            else:
                external.append(src)

        parent_a = img.find_parent("a")
        href = parent_a.get("href") if parent_a else None
        if href and Path(href.split("?")[0]).suffix:
            if TARGET_DOMAIN in href:
                new_href, exists = _resolve_image_path(href)
                parent_a["href"] = new_href
                if not exists:
                    unresolved.append(href)
            elif href not in external:
                external.append(href)

    return unresolved, external


# A social-follow signature block (Twitter/Twitch/YouTube links, often
# followed by an embedded MailChimp newsletter form) appears appended after
# the real content on many posts. Its exact markup varies per era/post and
# includes malformed HTML (a broken nested-quote Twitch link observed live),
# so identifying every piece individually is unreliable -- truncating
# everything from this one stable, well-formed marker onward (by position,
# not by trying to match each noise element) is far more robust.
TRUNCATE_AT_SELECTORS = ("a.twitter-follow-button",)

# Defense-in-depth for posts that have the MailChimp widget without the
# Twitter marker preceding it (so the truncate-from-marker pass above
# wouldn't have caught it). .sharedaddy is Jetpack's "Share this:" widget
# (Email/Facebook/Reddit/Twitter share links) -- confirmed leaking into
# committed post bodies as a fake bullet list before this fix.
NOISE_SELECTORS = ("#mc_embed_signup", "style", "link", ".sharedaddy")


def clean_body(content_soup):
    for sel in TRUNCATE_AT_SELECTORS:
        marker = content_soup.select_one(sel)
        if marker:
            for sib in list(marker.find_next_siblings()):
                sib.decompose()
            for sib in list(marker.previous_siblings):
                # <br/> spacing and a bare dash-separator line (a manual
                # "---" typed directly before the signature block, not
                # markdown-generated) are part of the same block being
                # removed, not real content -- stop at the first sibling
                # that's neither.
                if getattr(sib, "name", None) == "br":
                    sib.decompose()
                elif isinstance(sib, NavigableString) and not sib.strip("-–— \t\n"):
                    sib.extract()
                else:
                    break
            marker.decompose()

    for sel in NOISE_SELECTORS:
        for el in content_soup.select(sel):
            el.decompose()
    # Attachment-page wrapper shouldn't appear in a real post, but strip
    # defensively in case a borderline capture slips through classification.
    for el in content_soup.select(".entry-attachment"):
        el.decompose()


def is_real_post(soup):
    """Distinguish an authored post from a WordPress attachment page (both
    can sit at a dated permalink and share entry-title/entry-content/
    entry-date markup) -- attachment pages carry an image-navigation nav
    the theme never renders on a real post, and their entry-content is just
    an .entry-attachment wrapper with no real paragraph text."""
    if soup.select_one("nav.navigation-image"):
        return False
    content = soup.select_one(".entry-content")
    if not content:
        return False
    text_len = len(content.get_text(strip=True))
    return text_len >= 200


def slugify_title(title):
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "untitled"


TOML_ESCAPES = {"\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t"}
TOML_ESCAPE_RE = re.compile(r'[\\"\n\r\t]')


def toml_string(s):
    # get_text(strip=True) only strips the ends -- an internal newline/tab
    # surviving from the source markup would otherwise emit invalid TOML
    # that Hugo fails to parse.
    return '"' + TOML_ESCAPE_RE.sub(lambda m: TOML_ESCAPES[m.group()], s) + '"'


def convert_one(path, dry_run=False):
    """Returns a dict describing the outcome, or None if excluded."""
    raw = path.read_text(encoding="utf-8", errors="replace")
    soup = BeautifulSoup(raw, "html.parser")

    if not is_real_post(soup):
        return None

    title_el = soup.select_one("h1.entry-title")
    if title_el:
        title = title_el.get_text(strip=True)
    else:
        title_tag = soup.select_one("title")
        title = title_tag.get_text(strip=True).split("|")[0].strip() if title_tag else None
    if not title:
        return None

    slug, filename_date = extract_slug_and_filename_date(path.stem)
    if slug is None:
        return None
    date = parse_date(soup, filename_date)
    if date is None:
        return None

    author = parse_author(soup)
    categories, tags = parse_terms(soup)

    content_el = soup.select_one(".entry-content")
    clean_body(content_el)
    unresolved_images, external_images = rewrite_images(content_el)
    body_md = md(str(content_el), heading_style="ATX").strip()

    slug = slugify_title(slug) if not re.match(r'^[a-z0-9-]+$', slug) else slug
    dst = OUTPUT_CONTENT_DIR / f"{slug}.md"

    result = {
        "src": path.name,
        "slug": slug,
        "title": title,
        "date": date,
        "unresolved_images": unresolved_images,
        "external_images": external_images,
        "collision": dst.exists(),
    }

    if dry_run or result["collision"]:
        return result

    OUTPUT_CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    front_matter = [
        "+++",
        f"title = {toml_string(title)}",
        f"date = {toml_string(date.strftime('%Y-%m-%dT%H:%M:%S%z') if date.tzinfo else date.strftime('%Y-%m-%dT%H:%M:%S'))}",
        "draft = false",
    ]
    if author:
        front_matter.append(f"author = {toml_string(author)}")
    if categories:
        front_matter.append("categories = [" + ", ".join(toml_string(c) for c in categories) + "]")
    if tags:
        front_matter.append("tags = [" + ", ".join(toml_string(t) for t in tags) + "]")
    front_matter.append("+++")

    dst.write_text("\n".join(front_matter) + "\n\n" + body_md + "\n", encoding="utf-8")
    return result


def main():
    limit = None
    dry_run = False
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "--dry-run":
            dry_run = True
            i += 1
        elif arg == "--limit":
            if i + 1 >= len(args):
                print("[!] --limit requires a value")
                sys.exit(1)
            try:
                limit = int(args[i + 1])
            except ValueError:
                print(f"[!] Invalid --limit value: {args[i + 1]!r}")
                sys.exit(1)
            i += 2
        else:
            print(f"[!] Unrecognized argument: {arg!r}")
            print(__doc__)
            sys.exit(1)

    candidates = iter_candidate_files(limit)
    converted, excluded, collisions, failed = [], 0, [], []
    total_unresolved_images = 0
    total_external_images = 0

    for path in candidates:
        try:
            result = convert_one(path, dry_run=dry_run)
        except Exception as e:
            failed.append((path.name, f"{type(e).__name__}: {e}"))
            continue
        if result is None:
            excluded += 1
            continue
        if result["collision"]:
            collisions.append((path.name, result["slug"]))
            continue
        converted.append(result)
        total_unresolved_images += len(result["unresolved_images"])
        total_external_images += len(result["external_images"])

    print("\n" + "=" * 70)
    print("HTML -> MARKDOWN CONVERSION SUMMARY")
    print("=" * 70)
    print(f"  Candidate HTML files:      {len(candidates)}")
    print(f"  Converted:                 {len(converted)}" + (" (dry run, not written)" if dry_run else ""))
    print(f"  Excluded (not a post):     {excluded}")
    print(f"  Slug collisions (skipped): {len(collisions)}")
    for name, slug in collisions:
        print(f"    - {name} -> {slug}")
    print(f"  Failed:                    {len(failed)}")
    for name, err in failed:
        print(f"    - {name}: {err}")
    print(f"  Unresolved image refs:     {total_unresolved_images} (davevoyles.com image not yet in static/images/ -- recovery may still be running, this count should reach zero)")
    print(f"  External image refs:      {total_external_images} (hosted on a legacy/other domain, out of D3's recovery scope -- will NEVER resolve via D4; left as external hotlinks, a D6 stale-link candidate)")
    print("=" * 70)

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
