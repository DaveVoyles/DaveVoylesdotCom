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
    scripts/.venv/bin/python3 scripts/process_images.py [--limit N] [--dry-run]

Options:
    --limit N   Process only the first N images (for fast verification runs)
    --dry-run   Attempt to open every image (catching identify failures) and
                report what would be processed, without writing any files
"""

import sys
import os
import shutil
import tempfile
from pathlib import Path
from PIL import Image, ImageSequence, UnidentifiedImageError

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


def _mktemp_near(dst):
    """Reserve a temp file path in dst's directory. Caller writes the
    candidate output there, then decides whether to commit it (os.replace)
    or discard it -- writes never land on dst directly, so a crash/kill
    mid-write can never leave a partial file that a later run's
    dst.exists() check would mistake for already-processed."""
    fd, tmp_name = tempfile.mkstemp(dir=dst.parent, prefix=dst.name + ".", suffix=".tmp")
    os.close(fd)
    return Path(tmp_name)


def _encode_static(im, dst):
    """Encode a resized non-animated image (JPEG/PNG/single-frame GIF) to a
    temp file. Returns the temp path; caller decides whether to keep it."""
    ext = dst.suffix.lower()
    tmp = _mktemp_near(dst)
    if ext in (".jpg", ".jpeg"):
        im.convert("RGB").save(tmp, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    elif ext == ".png":
        im.save(tmp, "PNG", optimize=PNG_OPTIMIZE)
    elif ext == ".gif":
        im.save(tmp, "GIF", optimize=True)
    else:
        im.save(tmp)
    return tmp


def _encode_animated_gif(im, dst):
    """Encode a resized animated GIF to a temp file, preserving each frame's
    own duration (not a single value collapsed across all frames)."""
    frames = []
    durations = []
    for frame in ImageSequence.Iterator(im):
        durations.append(frame.info.get("duration", 100))
        frame = frame.convert("RGBA")
        frame.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
        frames.append(frame)
    loop = im.info.get("loop", 0)
    tmp = _mktemp_near(dst)
    frames[0].save(
        tmp, "GIF", save_all=True, append_images=frames[1:],
        duration=durations, loop=loop, optimize=True, disposal=2,
    )
    return tmp


def process_one(src, dst):
    """
    Process a single recovered image into dst.
    Returns {"action": "copied"|"processed", "warning": str|None}.
    Raises on genuine failure -- caller records it.
    """
    if src.suffix.lower() == ".svg":
        shutil.copy2(src, dst)
        return {"action": "copied", "warning": None}

    try:
        im = Image.open(src)
        im.load()
    except UnidentifiedImageError:
        # Not a format Pillow can rasterize at all -- D3's broad "image/*" CDX
        # filter can pick up non-raster formats beyond just .svg by name.
        # Copy through unchanged rather than failing, matching the documented
        # "any non-rasterizable format" behavior instead of only .svg-by-name.
        shutil.copy2(src, dst)
        return {"action": "copied", "warning": None}

    with im:
        original_size = im.size
        animated = im.format == "GIF" and getattr(im, "n_frames", 1) > 1

        if animated:
            resized = im.copy()
            resized.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
            needs_resize = resized.size != original_size
            tmp = _encode_animated_gif(im, dst)
        else:
            im = im.convert("RGB") if im.mode == "CMYK" else im
            im.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
            needs_resize = im.size != original_size
            tmp = _encode_static(im, dst)

        src_size = src.stat().st_size
        tmp_size = tmp.stat().st_size

        # Dimension reduction always wins regardless of byte count -- an
        # oversized image must actually shrink for the page-load-weight goal
        # (ADR 0002) to mean anything. Byte size only decides the tossup when
        # dimensions are already fine: re-encoding a small, already-optimized
        # image (indexed-palette GIF, a small JPEG with progressive-encoding
        # overhead, etc.) can reliably come out BIGGER than the original with
        # zero resizing benefit -- confirmed live across GIFs and JPEGs in
        # this exact batch. In that case just keep the original bytes.
        if not needs_resize and tmp_size >= src_size:
            tmp.unlink(missing_ok=True)
            shutil.copy2(src, dst)
            return {"action": "copied", "warning": None}

        os.replace(tmp, dst)

    warning = f"grew {src_size}B -> {tmp_size}B (dimensions reduced)" if tmp_size > src_size else None
    return {"action": "processed", "warning": warning}


def process_all(limit=None, dry_run=False):
    files = iter_source_images(limit)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total_before = 0
    total_after = 0
    processed = 0
    skipped_existing = 0
    copied_unchanged = 0
    failed = []
    grew = []

    for src in files:
        total_before += src.stat().st_size
        # Preserve extension; strip the mimetype-derived double extension quirk
        # from recover_wayback_content.py's url_to_filename output isn't needed
        # here -- filenames already carry the correct single extension.
        dst = OUTPUT_DIR / src.name

        if dry_run:
            # Actually attempt to open every file so identify failures surface
            # here, not just at write time -- a genuine pre-flight check, not
            # just a file count.
            if src.suffix.lower() != ".svg":
                try:
                    with Image.open(src) as im:
                        im.load()
                except UnidentifiedImageError:
                    pass  # expected: would be copied through, not a failure
                except Exception as e:
                    failed.append((src.name, f"{type(e).__name__}: {e}"))
            continue

        if dst.exists():
            skipped_existing += 1
            total_after += dst.stat().st_size
            continue

        try:
            result = process_one(src, dst)
        except Exception as e:
            failed.append((src.name, f"{type(e).__name__}: {e}"))
            continue

        total_after += dst.stat().st_size
        if result["action"] == "copied":
            copied_unchanged += 1
        else:
            processed += 1
        if result["warning"]:
            grew.append((src.name, result["warning"]))

    return {
        "found": len(files),
        "processed": processed,
        "skipped_existing": skipped_existing,
        "copied_unchanged": copied_unchanged,
        "failed": failed,
        "grew": grew,
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
        print(f"  Would-fail-to-open:        {len(result['failed'])}")
        for name, err in result["failed"]:
            print(f"    - {name}: {err}")
        print("  DRY RUN -- no files written")
        print("=" * 70)
        return
    print(f"  Newly processed:           {result['processed']}")
    print(f"  Copied unchanged (SVG/etc):{result['copied_unchanged']:>4}")
    print(f"  Already processed (skip):  {result['skipped_existing']}")
    print(f"  Failed:                    {len(result['failed'])}")
    for name, err in result["failed"]:
        print(f"    - {name}: {err}")
    if result["grew"]:
        print(f"  WARNING -- grew in size:   {len(result['grew'])}")
        for name, detail in result["grew"]:
            print(f"    - {name}: {detail}")
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
