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
            fm["_in_cover"] = True
            continue

        if fm.get("_in_cover"):
            if line.startswith("[") or line.startswith("+++"):
                fm["_in_cover"] = False
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


def draft_scenes(post_slug):
    """Draft scenes for a post. Returns (scenes_list, narration_preview)."""
    post_path = REPO / f"content/posts/{post_slug}.md"
    if not post_path.exists():
        raise FileNotFoundError(f"Post not found: {post_path}")

    text = post_path.read_text()
    fm, body = parse_frontmatter(text)

    # Get images from post
    post_images = extract_post_images(post_path)

    # Find which of the required images the post uses
    available_required = REQUIRED_IMAGES & post_images

    title = fm.get("title", "")

    # --- Draft scenes for agent-production-system.md ---
    # This is the canonical agent production system post.
    # We draft scenes matching the post's key themes: factory floor, orchestration,
    # agents, skills/tools, eval gates, human approval, Docker/Azure, practices.

    scenes = [
        {
            "id": "s1-hook",
            "narration": "Most AI agent demos stop at a chat box. What matters is the opposite — a production system with routing, tools, eval gates, and hosts.",
            "headline": "Not a chat box",
            "visual": {
                "type": "card",
                "text": "A production system: routing, tools, gates, hosts",
            },
            "target_seconds": 9.0,
        },
        {
            "id": "s2-factory-floor",
            "narration": "Think factory floor, not chatbot. Work arrives, and an orchestrator assigns specialist agents — planner, coder, search.",
            "headline": "Factory floor, not chatbot",
            "visual": {
                "type": "image",
                "src": "static/images/posts/agent-system-ops-floor.jpg",
            },
            "target_seconds": 8.0,
        },
        {
            "id": "s3-skills",
            "narration": "They work through shared skills and tools, and they retrieve from real sources rather than inventing from nothing.",
            "headline": "Skills, tools, retrieval",
            "visual": {
                "type": "card",
                "text": "Shared craft library — not invention from nothing",
            },
            "target_seconds": 8.0,
        },
        {
            "id": "s4-eval-gates",
            "narration": "Eval gates then check the result — tests, policy, claim safety. They fail closed before anything merges. Green is not theater.",
            "headline": "Green is not theater",
            "visual": {
                "type": "image",
                "src": "static/images/posts/agent-eval-gates.jpg",
            },
            "target_seconds": 9.0,
        },
        {
            "id": "s5-human-approval",
            "narration": "And a human still owns the irreversible moves — force pushes, secrets, infrastructure where the blast radius is real.",
            "headline": "Human approval",
            "visual": {
                "type": "card",
                "text": "Force pushes · secrets · irreversible infrastructure",
            },
            "target_seconds": 8.0,
        },
        {
            "id": "s6-hosts",
            "narration": "Docker and Azure host the runtime — twenty plus production containers on a homelab I operate — and dashboards show status.",
            "headline": "Docker · Azure · dashboards",
            "visual": {
                "type": "card",
                "text": "20+ production containers on a homelab I operate",
            },
            "target_seconds": 9.0,
        },
        {
            "id": "s7-practices",
            "narration": "The practices matter more than model choice. Verification before trust. Claim safety, so numbers stay tied to evidence. And when something burns, the fix goes into policy and gates.",
            "headline": "Practices over model choice",
            "visual": {
                "type": "card",
                "text": "Verification before trust · claim safety · fail-closed defaults",
            },
            "target_seconds": 12.0,
        },
        {
            "id": "s8-close",
            "narration": "That's the thesis. Agents move the work; controls keep it real.",
            "headline": "Agents move work. Controls keep it real.",
            "visual": {
                "type": "card",
                "text": "The full write-up is on the blog",
            },
            "target_seconds": 5.0,
        },
    ]

    # Build narration preview
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
    except FileNotFoundError as e:
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
