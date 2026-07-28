#!/usr/bin/env python3
"""Insert a YouTube embed shortcode into a post's markdown.

Adds `{{< youtube VIDEO_ID >}}` immediately after a post's TOML front matter,
so a freshly-uploaded video can be embedded without a manual markdown edit.
Never touches privacy, never commits, never pushes — those stay manual
(ADR 0011).

Usage:
    tools/video/embed_video.py --post <slug> --video-id <id> [--force]
"""
import argparse
import os
import re
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent

FRONT_MATTER_RE = re.compile(r"^\+\+\+\n.*?\n\+\+\+\n", re.DOTALL)
SHORTCODE_RE = re.compile(r"\{\{<\s*youtube\s+(\S+?)\s*>\}\}")


def embed(post_slug: str, video_id: str, force: bool) -> Path:
    post_path = REPO / "content" / "posts" / f"{post_slug}.md"
    if not post_path.is_file():
        raise FileNotFoundError(f"post not found: {post_path}")

    text = post_path.read_text()
    match = FRONT_MATTER_RE.match(text)
    if not match:
        raise ValueError(f"could not find TOML front matter (+++...+++) in {post_path}")

    front_matter, body = text[: match.end()], text[match.end() :]
    shortcode = "{{< youtube %s >}}" % video_id

    existing = SHORTCODE_RE.search(body)
    if existing:
        if not force:
            raise ValueError(
                f"post already has an embed ({existing.group(0)}) — pass --force to replace it"
            )
        # lambda replacement so a video ID containing a backslash can't be
        # misinterpreted as a regex backreference by re.sub's string-repl path.
        body = SHORTCODE_RE.sub(lambda _m: shortcode, body, count=1)
    else:
        body = "\n" + shortcode + "\n" + body

    new_text = front_matter + body
    fd, tmp_name = tempfile.mkstemp(dir=post_path.parent, prefix=f".{post_path.name}.")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(new_text)
        os.replace(tmp_name, post_path)
    except BaseException:
        Path(tmp_name).unlink(missing_ok=True)
        raise
    return post_path


def main():
    parser = argparse.ArgumentParser(
        description="Insert a YouTube embed shortcode into a post's markdown"
    )
    parser.add_argument("--post", required=True, help="Post slug (content/posts/<slug>.md)")
    parser.add_argument("--video-id", required=True, help="YouTube video ID")
    parser.add_argument("--force", action="store_true", help="Replace an existing embed")
    args = parser.parse_args()

    try:
        path = embed(args.post, args.video_id, args.force)
    except (FileNotFoundError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    shortcode = "{{< youtube %s >}}" % args.video_id
    print(f"Inserted {shortcode} into {path}")
    print(f"Review the diff, then commit + push when ready: git diff {path}")


if __name__ == "__main__":
    main()
