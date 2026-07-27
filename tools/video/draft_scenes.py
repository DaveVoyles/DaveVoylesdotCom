#!/usr/bin/env python3
"""Draft video scenes from a post markdown — plan 0006 D5.

Takes a post slug, reads its markdown, and drafts a schema-valid scenes.json
constrained to docs/claim-safe-facts.md. Drafts 6-8 scenes with 140-160 words
total narration. Always stops and prints narration for approval — never renders.

Usage:
    tools/video/draft_scenes.py --post <slug> [--force]
    tools/video/draft_scenes.py --post <slug> --output <path> [--force]

Environment:
    POST=<slug>  alternative to --post
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent

WORD_MIN, WORD_MAX = 140, 160
SCENE_MIN, SCENE_MAX = 6, 8
REQUIRED_IMAGES = {
    "static/images/posts/agent-system-ops-floor.jpg",
    "static/images/posts/agent-eval-gates.jpg",
}

# Headings that are structurally boilerplate/meta for most posts in this
# corpus (link tables, series navigation, "what this is not" disclaimers) —
# skipped as scene material since they aren't narratable prose. Also skips
# sections whose lead sentence is likely to carry an unattested numeric claim
# (validate_scenes.py's claim-safety check only allows "twenty"/"20").
STOPLIST_HEADING_SUBSTRINGS = (
    "public artifact",
    "this series",
    "what this is",
    "xbox-scale",
)


def parse_frontmatter(text):
    """Extract TOML frontmatter (+++...+++) from markdown.
    Returns (frontmatter_dict, body_text).
    """
    if not text.startswith("+++"):
        return {}, text

    # Find closing +++
    parts = text.split("+++", 2)
    if len(parts) < 3:
        return {}, text

    fm_text = parts[1].strip()
    body = parts[2].lstrip("\n")

    # Parse TOML manually (enough for this use case)
    fm = {}
    in_cover = False
    for line in fm_text.split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        # title = "..."
        if line.startswith("title"):
            m = re.search(r'title\s*=\s*"([^"]*)"', line)
            if m:
                fm["title"] = m.group(1)

        # date = "..."
        if line.startswith("date"):
            m = re.search(r'date\s*=\s*"([^"]*)"', line)
            if m:
                fm["date"] = m.group(1)

        # [cover] section
        if line.startswith("[cover]"):
            in_cover = True
            continue

        if in_cover:
            if line.startswith("[") or line.startswith("+++"):
                in_cover = False
                continue
            m = re.search(r'image\s*=\s*"([^"]*)"', line)
            if m:
                fm["cover_image"] = m.group(1)

    return fm, body


def extract_post_images(post_path):
    """Extract image paths from post markdown (both cover and inline).
    Returns set of image paths in static/images/... format.
    """
    text = post_path.read_text()
    fm, body = parse_frontmatter(text)

    images = set()

    # Cover image
    if cover := fm.get("cover_image"):
        # convert /images/... → static/images/...
        if cover.startswith("/"):
            images.add(f"static{cover}")
        else:
            images.add(f"static/{cover}")

    # Inline images: ![alt](src)
    for m in re.finditer(r"!\[([^\]]*)\]\(([^)]+)\)", body):
        src = m.group(2)
        if src.startswith("/"):
            images.add(f"static{src}")
        else:
            images.add(f"static/{src}")

    return images


def extract_sections(body, title=""):
    """Split a post body into (heading, section_text) pairs at ## and ###
    headings. Any text before the first heading (the post's lede/hook
    paragraph) is captured as a leading section under the post's own title,
    since that opening paragraph is usually the best hook-scene material."""
    sections = []
    heading = title or "Introduction"
    lines_buf = []
    for line in body.split("\n"):
        m = re.match(r"^#{2,3}\s+(.+)$", line)
        if m:
            sections.append((heading, "\n".join(lines_buf).strip()))
            heading = re.sub(r"[*_`]", "", m.group(1)).strip()
            lines_buf = []
        else:
            lines_buf.append(line)
    sections.append((heading, "\n".join(lines_buf).strip()))
    return sections


def count_words(text):
    """Word count matching validate_scenes.py's words() exactly (regex-based,
    not str.split()) — a naive whitespace split undercounts relative to this
    (e.g. "exec-grade" is one split() token but two regex matches), which
    previously let a draft pass this module's own budget while still failing
    the real validator's stricter count."""
    return len(re.findall(r"[A-Za-z0-9']+", text))


def clean_bullet(item):
    """Strip a leading list marker ('- ', '* ', '1. ') from one list item's text."""
    return re.sub(r"^\s*(?:[-*]\s+|\d+\.\s+)", "", item).strip()


def _clean_markdown(s):
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"[*_`]", "", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    return re.sub(r"\s+", " ", s).strip()


def lead_sentence(section_text, max_words):
    """Build narration for a section by concatenating its usable text chunks
    (prose paragraphs in full, or list items if the section is list-only) in
    document order, up to max_words — not just the first sentence, so a
    section's narration has enough substance to help the whole draft reach
    the word-count target. Strips markdown emphasis/links/images. Trims the
    final included chunk to a sentence boundary where possible. Returns ""
    if the section has no usable text at all."""
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", section_text)
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    is_list_marker = re.compile(r"^\s*(?:[-*]\s+|\d+\.\s+|\|)")
    prose = [p for p in paras if not is_list_marker.match(p)]
    if prose:
        chunks = [_clean_markdown(p) for p in prose]
    else:
        list_paras = [p for p in paras if is_list_marker.match(p)]
        items = [item for p in list_paras for item in p.split("\n") if item.strip()]
        chunks = [_clean_markdown(clean_bullet(item)) for item in items]
    chunks = [c for c in chunks if c]
    if not chunks:
        return ""

    words, used = [], 0
    for chunk in chunks:
        chunk_words = chunk.split(" ")
        chunk_count = count_words(chunk)
        if used + chunk_count <= max_words:
            words.extend(chunk_words)
            used += chunk_count
        else:
            remaining = max_words - used
            if remaining >= 4:
                partial = " ".join(chunk_words[:remaining])
                m = re.search(r"^(.*[.!?])\s", partial + " ")
                words.extend((m.group(1) if m else partial).split(" "))
            break
    result = " ".join(words).strip()
    if result and not result.endswith((".", "!", "?", ":")):
        result += "."
    return result


def draft_scenes(post_slug):
    """Draft scenes from a post's actual markdown sections. Returns (scenes_list, narration_preview).

    Extractive, not generative: each scene's narration is derived from that
    section's own lead sentence (trimmed), not fabricated prose — so output
    genuinely varies with the post's content, and the mechanical claim-safety
    gate (scripts/check-content.sh) is the real check on whatever comes out,
    per the plan's "agent-drafted, human-approved" design.
    """
    post_path = REPO / f"content/posts/{post_slug}.md"
    if not post_path.exists():
        raise FileNotFoundError(f"Post not found: {post_path}")

    text = post_path.read_text()
    fm, body = parse_frontmatter(text)
    post_images = extract_post_images(post_path)
    available_required = sorted(REQUIRED_IMAGES & post_images)

    # Pull generously per section — most sections have more usable content
    # than a tight per-scene share would capture — and let the trim-pass
    # below bring the total back down to WORD_MAX if needed.
    per_scene_budget = max(12, (WORD_MAX * 2) // SCENE_MIN)
    candidates = []
    for heading, section_text in extract_sections(body, title=fm.get("title", "")):
        if any(s in heading.lower() for s in STOPLIST_HEADING_SUBSTRINGS):
            continue
        sentence = lead_sentence(section_text, per_scene_budget)
        if sentence:
            candidates.append((heading, sentence))
        if len(candidates) >= SCENE_MAX:
            break

    if not candidates:
        raise ValueError(f"No narratable sections found in {post_path} — draft manually")

    images_to_place = list(available_required)
    scenes = []
    for i, (heading, narration) in enumerate(candidates):
        sid = f"s{i + 1}-" + (re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")[:24] or "scene")
        if images_to_place:
            visual = {"type": "image", "src": images_to_place.pop(0)}
        else:
            visual = {"type": "card", "text": heading}
        scenes.append(
            {
                "id": sid,
                "narration": narration,
                "headline": heading,
                "visual": visual,
                "target_seconds": round(max(5.0, count_words(narration) / 2.2), 1),
            }
        )

    # Trim from the longest scene(s) if the total budget is exceeded — a
    # deterministic post-pass rather than relying on per-scene truncation
    # alone to land inside validate_scenes.py's WORD_MIN/WORD_MAX window.
    # Counted with count_words() (matching the validator's regex), not
    # str.split(), which undercounts hyphenated words and previously let a
    # draft pass this trim-pass while still failing the real validator.
    def total_words():
        return sum(count_words(s["narration"]) for s in scenes)

    while total_words() > WORD_MAX and scenes:
        longest = max(scenes, key=lambda s: count_words(s["narration"]))
        words = longest["narration"].split()
        if len(words) <= 8:
            break
        longest["narration"] = " ".join(words[: len(words) - 5]).rstrip(".,;: ") + "."

    narration_lines = [f"[{s['id']}] {s['narration']}" for s in scenes]
    narration_preview = "\n".join(narration_lines)
    return scenes, narration_preview


def main():
    parser = argparse.ArgumentParser(
        description="Draft video scenes from post markdown (plan 0006 D5)"
    )
    parser.add_argument("--post", help="Post slug (e.g., agent-production-system)")
    parser.add_argument(
        "--output", default="tools/video/scenes.json", help="Output scenes.json path"
    )
    parser.add_argument(
        "--force", action="store_true", help="Overwrite existing scenes.json"
    )
    args = parser.parse_args()

    # Get post slug from --post or POST env var
    post_slug = args.post or os.environ.get("POST")
    if not post_slug:
        print("error: --post <slug> or POST=<slug> required", file=sys.stderr)
        sys.exit(1)

    output_path = REPO / args.output

    # Check if output exists
    if output_path.exists() and not args.force:
        print(
            f"error: {output_path} already exists. Use --force to overwrite.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        scenes, narration_preview = draft_scenes(post_slug)
    except (FileNotFoundError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    # Build output structure
    output_data = {
        "post": f"content/posts/{post_slug}.md",
        "voice": "bm_lewis",
        "scenes": scenes,
    }

    # Write to temporary location first
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False, dir=str(output_path.parent)
    ) as tmp:
        json.dump(output_data, tmp, indent=2)
        tmp.write("\n")
        tmp_path = Path(tmp.name)

    print(f"Draft generated to {tmp_path}", file=sys.stderr)

    # Validate the candidate draft via each gate's overridable-path env var
    # (SCENES_FILE / VIDEO_SCENES_FILE) rather than mutating the tracked
    # tools/video/scenes.json in place — that pattern was found and fixed as
    # a real-file-corruption risk during D4's review (a killed process could
    # leave the tracked file holding an unapproved draft with no restore).
    try:
        env = {**os.environ, "SCENES_FILE": str(tmp_path)}

        print("\n=== Schema validation ===", file=sys.stderr)
        result = subprocess.run(
            [sys.executable, str(ROOT / "validate_scenes.py")],
            cwd=str(ROOT),
            env=env,
        )
        if result.returncode != 0:
            print("error: schema validation failed", file=sys.stderr)
            raise SystemExit(1)

        print("\n=== Claim-safety gate ===", file=sys.stderr)
        result = subprocess.run(
            ["bash", str(REPO / "scripts/check-content.sh")],
            cwd=str(REPO),
            env={**os.environ, "VIDEO_SCENES_FILE": str(tmp_path)},
        )
        if result.returncode != 0:
            print("error: claim-safety gate failed", file=sys.stderr)
            raise SystemExit(1)

        # All gates passed, move to final location
        output_path.write_text(tmp_path.read_text())
        print(f"\nScenes written to {output_path}", file=sys.stderr)

    finally:
        # Clean up temp file
        if tmp_path.exists():
            tmp_path.unlink()

    # Print narration for approval
    print("\n=== NARRATION FOR APPROVAL ===\n", file=sys.stderr)
    print(narration_preview, file=sys.stderr)
    print("\n=== END NARRATION ===\n", file=sys.stderr)
    print(
        "✓ Draft passes all gates. Review the narration above, then run: make video-render",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
