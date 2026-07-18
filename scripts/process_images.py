#!/usr/bin/env python3
"""
Image processing pipeline for davevoyles.com (D4).

Resizes and compresses images recovered by D3's recover_wayback_content.py
(content-recovery/staging/images/) and places them under the Hugo site's
static assets (static/images/), per ADR 0002 (images committed directly to
the repo, no LFS, no hotlinking).

Requires Pillow, which is NOT in the repo's normal stdlib-only convention --
install it in a dedicated venv (see scripts/README.md) rather than the
system/Homebrew Python, which blocks bare `pip install` (PEP 668).

Usage:
    .venv/bin/python3 scripts/process_images.py [--limit N] [--dry-run]

Options:
    --limit N   Process only the first N images (for fast verification runs)
    --dry-run   Report what would be processed without writing any files
"""

import sys
import os
import shutil
from pathlib import Path
from PIL import Image, ImageSequence

STAGING_IMAGES_DIR = Path("content-recovery/staging/images")
OUTPUT_DIR = Path("static/images")

# Longest-edge cap in pixels. Images already smaller than this are left at
# their original resolution (thumbnail() only ever shrinks, never enlarges).
MAX_DIMENSION = 1600

JPEG_QUALITY = 82
PNG_OPTIMIZE = True


def iter_source_images(limit=None):
    if not STAGING_IMAGES_DIR.is_dir():
        print(f"[!] {STAGING_IMAGES_DIR} does not exist -- run recover_wayback_content.py first")
        sys.exit(1)
    files = sorted(p for p in STAGING_IMAGES_DIR.iterdir() if p.is_file())
    return files[:limit] if limit else files


def process_static_image(src, dst):
    """Resize + re-save a non-animated image (JPEG/PNG/single-frame GIF)."""
    with Image.open(src) as im:
        im = im.convert("RGB") if im.mode in ("CMYK",) else im
        im.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

        ext = dst.suffix.lower()
        if ext in (".jpg", ".jpeg"):
            im.convert("RGB").save(dst, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        elif ext == ".png":
            im.save(dst, "PNG", optimize=PNG_OPTIMIZE)
        elif ext == ".gif":
            im.save(dst, "GIF", optimize=True)
        else:
            im.save(dst)


def process_animated_gif(src, dst):
    """Resize every frame of an animated GIF, preserving duration/loop/transparency."""
    with Image.open(src) as im:
        duration = im.info.get("duration", 100)
        loop = im.info.get("loop", 0)
        frames = []
        for frame in ImageSequence.Iterator(im):
            frame = frame.convert("RGBA")
            frame.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
            frames.append(frame)
        frames[0].save(
            dst, "GIF", save_all=True, append_images=frames[1:],
            duration=duration, loop=loop, optimize=True, disposal=2,
        )


def is_animated_gif(path):
    try:
        with Image.open(path) as im:
            return im.format == "GIF" and getattr(im, "n_frames", 1) > 1
    except Exception:
        return False


def process_all(limit=None, dry_run=False):
    files = iter_source_images(limit)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total_before = 0
    total_after = 0
    processed = 0
    skipped_existing = 0
    copied_unchanged = 0
    failed = []

    for src in files:
        total_before += src.stat().st_size
        # Preserve extension; strip the mimetype-derived double extension quirk
        # from recover_wayback_content.py's url_to_filename output isn't needed
        # here -- filenames already carry the correct single extension.
        dst = OUTPUT_DIR / src.name

        if dry_run:
            continue

        if dst.exists():
            skipped_existing += 1
            total_after += dst.stat().st_size
            continue

        # SVG (and any other non-rasterizable format D3's broad "image/*" CDX
        # filter picked up, e.g. icon-font SVGs) can't go through Pillow at
        # all -- vector, not pixels. Copy through unchanged rather than
        # failing; these are typically tiny and don't need resize/compress.
        if src.suffix.lower() == ".svg":
            shutil.copy2(src, dst)
            total_after += dst.stat().st_size
            copied_unchanged += 1
            continue

        try:
            if src.suffix.lower() == ".gif" and is_animated_gif(src):
                process_animated_gif(src, dst)
            else:
                process_static_image(src, dst)
            total_after += dst.stat().st_size
            processed += 1
        except Exception as e:
            failed.append((src.name, str(e)))

    return {
        "found": len(files),
        "processed": processed,
        "skipped_existing": skipped_existing,
        "copied_unchanged": copied_unchanged,
        "failed": failed,
        "total_before": total_before,
        "total_after": total_after,
        "dry_run": dry_run,
    }


def format_bytes(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f}{unit}"
        n /= 1024
    return f"{n:.1f}TB"


def print_report(result):
    print("\n" + "=" * 70)
    print("IMAGE PROCESSING SUMMARY")
    print("=" * 70)
    print(f"  Images found in staging:   {result['found']}")
    if result["dry_run"]:
        print("  DRY RUN -- no files written")
        print("=" * 70)
        return
    print(f"  Newly processed:           {result['processed']}")
    print(f"  Copied unchanged (SVG/etc):{result['copied_unchanged']:>4}")
    print(f"  Already processed (skip):  {result['skipped_existing']}")
    print(f"  Failed:                    {len(result['failed'])}")
    for name, err in result["failed"]:
        print(f"    - {name}: {err}")
    print(f"\n  Total size before:         {format_bytes(result['total_before'])}")
    print(f"  Total size after:          {format_bytes(result['total_after'])}")
    if result["total_before"] > 0:
        pct = 100 * (1 - result["total_after"] / result["total_before"])
        print(f"  Reduction:                 {pct:.1f}%")
    print("=" * 70)


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

    result = process_all(limit=limit, dry_run=dry_run)
    print_report(result)
    if result["failed"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
