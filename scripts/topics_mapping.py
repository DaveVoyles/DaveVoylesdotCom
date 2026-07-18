#!/usr/bin/env python3
"""
Topics-mapping script for davevoyles.com (plan 0002 / D1)

Maps each post's existing `tags`/`categories` values to a curated `topics`
bucket list via a reviewable lookup table (TAG_TO_TOPIC below), and writes a
`topics = [...]` array into each post's front matter. Never touches the
existing `tags`/`categories` fields. Posts where no tag/category value has a
mapping are left untouched and printed in a separate "no confident mapping"
report for manual assignment -- never silently guessed.

Idempotent: a post that already has a `topics` field is left alone on
re-run (a prior real run, or a manual assignment from the unmapped report),
same precedent as triage_stale_content.py's `draft = true` skip.

Usage:
    python3 scripts/topics_mapping.py [--dry-run] [--limit N]

Options:
    --dry-run   Evaluate and report, but don't write changes to files.
    --limit N   Process only the first N posts (for testing).
"""

import re
import sys
from pathlib import Path

CONTENT_DIR = Path("content/posts")

# The curated topic-bucket list (plan 0002). Order here is the canonical
# display/assignment order -- a post matching multiple buckets gets its
# `topics` array written in this order, not tag-encounter order, so output
# is deterministic regardless of how a post's tags/categories are ordered.
# "AI / Agents" and "Public Speaking / Presentations" are reserved buckets
# with no current tag/category signal in the recovered corpus (this blog
# predates both as topics) -- expected to stay empty until new posts land,
# not a mapping gap.
TOPICS = [
    "Gaming",
    "Tech",
    "AI / Agents",
    "Public Speaking / Presentations",
    "Career / Students",
    "Journalism / Marketing / PR",
]

# Reviewable lookup table: each existing tag/category *value* (case-
# insensitive) maps to exactly one topic bucket. Built by cross-referencing
# the full corpus's unique tags/categories (`git grep -h '^tags = \|^categories = '
# content/posts/*.md`) against the six buckets above. Values with no clear,
# confident bucket (e.g. "Uncategorized", a stray person's name, a one-off
# personal-life tag like "Hurricane"/"Irene") are deliberately left out of
# this table so posts carrying only those values fall through to the
# unmapped report rather than being force-guessed.
_TOPIC_VALUES = {
    "Gaming": [
        "Game Dev", "Game Development", "Gaming", "Game jam", "GamesCom",
        "GDC", "GDC Europe", "Consoles", "Sony", "Vita", "PS4", "Xbox",
        "Xbox One", "Xbone", "XBLA", "XBLIG", "Mega Man", "Mega Man 2",
        "Persona 4", "Atlus", "Death Sentence", "Shmup", "Super Rawr-Type",
        "PAX", "PAX East", "PAX Prime", "Postmortem", "post-mortem",
        "Indie Games", "indie games summer uprising", "igsu",
        "Summer Uprising", "Dream.Build.Play", "Conelle", "Unity", "Unreal",
        "Unreal Engine", "UnrealScript", "Unreal Script", "UDK", "MonoGame",
        "ImpactJS", "XNA", "XNA / XBLIG", "SmartGlass", "Environment Art",
        "Dev Diary", "MM2 Dev Diary",
    ],
    "Tech": [
        "Tech", "Programming", "C#", "C++", "C++ / DirectX 11", "DirectX 11",
        "HTML5", "Javascript / HTML5", "JavaScript", "jQuery", "WebGL",
        "babylonJS", "XAML", "Azure", "Windows 8", "Win8", "Windows 10",
        "Windows Phone", "Windows Phone 8", "WP8", "UWP", "Mobile",
        "Web Development", "Web Dev", "Web App Template", "Visual Studio",
        "Cordova", "Microsoft", "open source", "Cameras", "Productivity",
        "Tutorial",
    ],
    "Career / Students": [
        "Students", "Resume", "BizSpark", "Startups", "Venture Capital",
    ],
    "Journalism / Marketing / PR": [
        "Journalism", "Marketing", "PR", "Marketing / PR",
        "Armless Octopus", "Features", "Recommendations", "Year in Review",
        "podcast", "Promotions",
    ],
}

TAG_TO_TOPIC = {
    value.lower(): topic
    for topic, values in _TOPIC_VALUES.items()
    for value in values
}

FRONT_MATTER_RE = re.compile(r"^\+\+\+\n(.*?)\n\+\+\+\n", re.DOTALL)


def load_front_matter(path):
    """Returns (text, fm, fm_start, fm_end) for a TOML `+++` front-matter
    block, or None if the text doesn't start with one (e.g. a YAML `---`
    post like hello-world.md) -- same precedent as
    triage_stale_content.py's load_front_matter_from_text."""
    text = path.read_text(encoding="utf-8")
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return None
    return text, m.group(1), m.start(1), m.end(1)


def extract_list_field(fm, key):
    m = re.search(rf"^{key} = \[(.*?)\]", fm, re.MULTILINE)
    if not m:
        return []
    return re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))


def has_topics_field(fm):
    return re.search(r"^topics = \[", fm, re.MULTILINE) is not None


def map_post_topics(tags, categories):
    """Returns the deduped list of matched topics, in TOPICS canonical
    order (not tag-encounter order)."""
    matched = set()
    for value in [*tags, *categories]:
        topic = TAG_TO_TOPIC.get(value.strip().lower())
        if topic:
            matched.add(topic)
    return [t for t in TOPICS if t in matched]


def toml_string(s):
    escapes = {"\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t"}
    return '"' + re.sub(r'[\\"\n\r\t]', lambda m: escapes[m.group()], s) + '"'


def apply_topics_field(text, fm, fm_start, fm_end, topics):
    """Appends a `topics = [...]` line as the last field in the front
    matter, regardless of existing field order -- robust to any layout."""
    topics_line = "topics = [" + ", ".join(toml_string(t) for t in topics) + "]"
    new_fm = fm + "\n" + topics_line
    return text[:fm_start] + new_fm + text[fm_end:]


def iter_candidate_files(limit=None):
    files = sorted(CONTENT_DIR.glob("*.md"))
    return files[:limit] if limit is not None else files


def parse_args(argv):
    dry_run = False
    limit = None
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--dry-run":
            dry_run = True
            i += 1
        elif arg == "--limit":
            if i + 1 >= len(argv):
                print("[!] --limit requires a value")
                sys.exit(1)
            limit = int(argv[i + 1])
            i += 2
        else:
            print(f"[!] Unrecognized argument: {arg!r}")
            print(__doc__)
            sys.exit(1)
    return dry_run, limit


def main():
    dry_run, limit = parse_args(sys.argv[1:])

    files = iter_candidate_files(limit)
    no_front_matter = 0
    already_tagged = []
    assigned = []
    unmapped = []

    for path in files:
        loaded = load_front_matter(path)
        if loaded is None:
            no_front_matter += 1
            print(f"  [!] {path.name}: no TOML front matter, skipping (see unmapped report)")
            unmapped.append((path, "no TOML front matter -- needs manual review"))
            continue
        text, fm, fm_start, fm_end = loaded

        if has_topics_field(fm):
            already_tagged.append(path)
            continue

        tags = extract_list_field(fm, "tags")
        categories = extract_list_field(fm, "categories")
        topics = map_post_topics(tags, categories)

        if not topics:
            unmapped.append((path, f"no tag/category matched a topic bucket (tags={tags}, categories={categories})"))
            continue

        assigned.append((path, topics))
        if not dry_run:
            new_text = apply_topics_field(text, fm, fm_start, fm_end, topics)
            path.write_text(new_text, encoding="utf-8")

    print("\n" + "=" * 70)
    print("TOPICS-MAPPING SUMMARY")
    print("=" * 70)
    print(f"  Evaluated:                 {len(files)}" + (" (dry run, not written)" if dry_run else ""))
    print(f"  Assigned topics:           {len(assigned)}")
    for path, topics in assigned:
        print(f"    - {path.name}: {topics}")
    print(f"  Already had topics field:  {len(already_tagged)} (untouched -- prior run or manual assignment)")
    print(f"  UNMAPPED (needs manual review): {len(unmapped)}")
    for path, reason in unmapped:
        print(f"    - {path.name}: {reason}")
    print("=" * 70)


if __name__ == "__main__":
    main()
