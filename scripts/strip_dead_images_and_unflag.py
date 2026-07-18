#!/usr/bin/env python3
"""
One-off follow-up to D6's triage_stale_content.py (issue #6 / PR #17).

For the subset of D6-flagged posts whose *only* rendering risk is a broken
image reference (all other flagged posts were already unflagged directly --
see PR #18), strip the broken image markdown (and its wrapping link, for the
`[![alt](url)](url)` linked-image convention this blog uses) and unflag the
post, per Dave's call: keep the text content, let the missing images just
disappear rather than hiding the whole post.

A host that fails DNS resolution (confirmed once via socket.getaddrinfo, not
per-image) is treated as broken without a live HTTP check -- retrying a
non-resolving host per image wastes the retry/backoff window for no signal.
Every other host gets a real check_url() call, reused from
triage_stale_content.py rather than reimplemented.

After stripping, each post is re-scanned for any remaining broken image --
if one remains (a host not covered by the known-dead list, live-checked as
still broken), the post is left flagged and reported rather than silently
force-unflagged.

Usage:
    python3 scripts/strip_dead_images_and_unflag.py <file> [<file> ...]
    python3 scripts/strip_dead_images_and_unflag.py --dry-run <file> [...]
"""
import sys
import socket
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from triage_stale_content import check_url, load_front_matter, FRONT_MATTER_RE  # noqa: E402

CONTENT_DIR = Path("content/posts")

# Confirmed via `host <domain>` -- genuinely dead (NXDOMAIN), not a sandbox
# artifact. Skipping the live check for these is a speed optimization, not a
# correctness shortcut: a non-resolving host is broken regardless of retries.
KNOWN_DEAD_HOSTS = {"davevoyles.azurewebsites.net"}

_dns_cache = {}


def host_resolves(host):
    if host not in _dns_cache:
        try:
            socket.getaddrinfo(host, None)
            _dns_cache[host] = True
        except socket.gaierror:
            _dns_cache[host] = False
    return _dns_cache[host]


def is_broken(url):
    host = urllib.parse.urlparse(url).netloc.lower()
    if host in KNOWN_DEAD_HOSTS or not host_resolves(host):
        return True, "DNS: does not resolve"
    ok, detail = check_url(url)
    return (not ok), detail


# Matches this blog's two image conventions. Linked-image tried first so a
# `[![alt](img)](href)` construct is removed whole, not left with a dangling
# empty link after the inner image-only pattern strips just the image part.
LINKED_IMG_RE = (
    r'\[!\[[^\]]*\]\((https?://[^)\s]+?)(?:\s+"[^"]*")?\)\]'
    r'\((?:https?://[^)\s]+?)(?:\s+"[^"]*")?\)'
)
PLAIN_IMG_RE = r'!\[[^\]]*\]\((https?://[^)\s]+?)(?:\s+"[^"]*")?\)'

import re  # noqa: E402
IMG_CONSTRUCT_RE = re.compile(f'(?:{LINKED_IMG_RE})|(?:{PLAIN_IMG_RE})')


def strip_broken_images(body):
    """Returns (new_body, removed: [(url, detail)], kept_broken: [(url, detail)])."""
    removed = []
    kept_broken = []

    def repl(m):
        url = m.group(1) or m.group(2)
        broken, detail = is_broken(url)
        if broken:
            removed.append((url, detail))
            return ""
        return m.group(0)

    new_body = IMG_CONSTRUCT_RE.sub(repl, body)

    # Re-scan the result for any image reference still pointing at a broken
    # URL (would mean a construct this regex didn't match, e.g. non-standard
    # markup) -- surfaced, never silently left in place.
    for m in IMG_CONSTRUCT_RE.finditer(new_body):
        url = m.group(1) or m.group(2)
        broken, detail = is_broken(url)
        if broken:
            kept_broken.append((url, detail))

    return new_body, removed, kept_broken


def unflag(front_matter):
    new_fm, count = re.subn(
        r"^draft = true\nstale_reason = \"(?:[^\"\\]|\\.)*\"$",
        "draft = false",
        front_matter,
        count=1,
        flags=re.MULTILINE,
    )
    if count != 1:
        raise ValueError("could not find draft=true/stale_reason to rewrite")
    return new_fm


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    files = [a for a in args if a != "--dry-run"]
    if not files:
        print(__doc__)
        sys.exit(2)

    clean, needs_attention = [], []

    for fname in files:
        path = CONTENT_DIR / fname
        text = path.read_text(encoding="utf-8")
        m = FRONT_MATTER_RE.match(text)
        if not m:
            print(f"!! {fname}: no front matter found, skipping")
            needs_attention.append(fname)
            continue
        fm_end = m.end()
        front_matter, body = text[:fm_end], text[fm_end:]

        new_body, removed, kept_broken = strip_broken_images(body)

        print(f"\n=== {fname} ===")
        for url, detail in removed:
            print(f"  removed (broken: {detail}): {url}")

        if kept_broken:
            for url, detail in kept_broken:
                print(f"  !! STILL BROKEN, not covered by stripper ({detail}): {url}")
            needs_attention.append(fname)
            continue

        try:
            new_front_matter = unflag(front_matter)
        except ValueError as e:
            print(f"  !! {e}")
            needs_attention.append(fname)
            continue

        if not dry_run:
            path.write_text(new_front_matter + new_body, encoding="utf-8")
        clean.append(fname)
        print(f"  -> unflagged ({len(removed)} broken image construct(s) removed)")

    print(f"\n{'DRY RUN — ' if dry_run else ''}Clean & unflagged: {len(clean)}/{len(files)}")
    if needs_attention:
        print(f"Needs attention (left flagged): {len(needs_attention)}")
        for f in needs_attention:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
