#!/usr/bin/env python3
"""Render 1920x1080 text cards for card-type scenes, in the site's dark aesthetic.

Idempotent: regenerates every card from scenes.json alone.

    ./.venv/bin/python render_cards.py --outdir work/cards
"""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent

W, H = 1920, 1080

# Palette lifted from assets/css/extended/custom.css (dark theme).
BG = (13, 15, 13)
PRIMARY = (239, 236, 224)
CONTENT = (195, 192, 179)
SECONDARY = (138, 143, 125)
BORDER = (38, 48, 38)

FONT_BOLD = ("/System/Library/Fonts/Avenir Next.ttc", 0)
FONT_DEMI = ("/System/Library/Fonts/Avenir Next.ttc", 2)

MARGIN = 150
RULE_W = 6


def font(spec, size):
    path, index = spec
    return ImageFont.truetype(path, size, index=index)


def wrap(draw, text, fnt, max_w):
    """Greedy word wrap to a pixel width."""
    lines, line = [], []
    for word in text.split():
        trial = " ".join(line + [word])
        if draw.textlength(trial, font=fnt) <= max_w or not line:
            line.append(word)
        else:
            lines.append(" ".join(line))
            line = [word]
    if line:
        lines.append(" ".join(line))
    return lines


def fit_lines(draw, text, spec, max_w, start_size, min_size, max_lines):
    """Shrink the font until the wrapped text fits in max_lines."""
    size = start_size
    while size > min_size:
        fnt = font(spec, size)
        lines = wrap(draw, text, fnt, max_w)
        if len(lines) <= max_lines:
            return fnt, lines
        size -= 4
    fnt = font(spec, min_size)
    return fnt, wrap(draw, text, fnt, max_w)


def render_card(headline, subtext, out_path):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Hairline frame — echoes the site's --border on cards.
    d.rectangle([MARGIN - 60, 70, W - MARGIN + 60, H - 70], outline=BORDER, width=2)

    max_w = W - 2 * MARGIN
    head_font, head_lines = fit_lines(d, headline, FONT_BOLD, max_w, 116, 64, 3)
    sub_font, sub_lines = fit_lines(d, subtext, FONT_DEMI, max_w, 54, 34, 3)

    head_lh = int(head_font.size * 1.18)
    sub_lh = int(sub_font.size * 1.35)
    gap = 58

    block_h = len(head_lines) * head_lh + gap + len(sub_lines) * sub_lh
    y = (H - block_h) // 2

    # Accent rule to the left of the headline block.
    d.rectangle(
        [MARGIN - 44, y + 12, MARGIN - 44 + RULE_W, y + len(head_lines) * head_lh - 12],
        fill=SECONDARY,
    )

    for line in head_lines:
        d.text((MARGIN, y), line, font=head_font, fill=PRIMARY)
        y += head_lh
    y += gap
    for line in sub_lines:
        d.text((MARGIN, y), line, font=sub_font, fill=CONTENT)
        y += sub_lh

    footer = font(FONT_DEMI, 30)
    d.text((MARGIN, H - 148), "davevoyles.com", font=footer, fill=SECONDARY)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    return out_path


def render_table(headline, headers, rows, out_path):
    """A 2-column comparison chart in the site's dark aesthetic — a real
    visual for structured content (e.g. a post's own markdown table)
    instead of forcing it into a text card."""
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    d.rectangle([MARGIN - 60, 70, W - MARGIN + 60, H - 70], outline=BORDER, width=2)

    max_w = W - 2 * MARGIN
    head_font, head_lines = fit_lines(d, headline, FONT_BOLD, max_w, 76, 48, 2)
    head_lh = int(head_font.size * 1.18)
    y = 130
    d.rectangle([MARGIN - 44, y + 6, MARGIN - 44 + RULE_W, y + len(head_lines) * head_lh - 6], fill=SECONDARY)
    for line in head_lines:
        d.text((MARGIN, y), line, font=head_font, fill=PRIMARY)
        y += head_lh
    y += 40

    col_w = (max_w - 60) // 2
    col1_x, col2_x = MARGIN, MARGIN + col_w + 60

    header_font = font(FONT_BOLD, 40)
    cell_font = font(FONT_DEMI, 34)
    row_gap = 28
    n_rows = len(rows)
    available_h = H - 70 - y
    row_h = max(70, min(140, (available_h - row_gap) // max(1, n_rows + 1)))

    def draw_cell(x, text, fnt, fill, top):
        lines = wrap(d, text, fnt, col_w)[:3]
        for i, line in enumerate(lines):
            d.text((x, top + i * int(fnt.size * 1.25)), line, font=fnt, fill=fill)
        return len(lines) * int(fnt.size * 1.25)

    draw_cell(col1_x, headers[0], header_font, SECONDARY, y)
    draw_cell(col2_x, headers[1], header_font, SECONDARY, y)
    y += row_h
    d.line([(MARGIN, y - row_gap // 2), (W - MARGIN, y - row_gap // 2)], fill=BORDER, width=2)

    for c1, c2 in rows:
        h1 = draw_cell(col1_x, c1, cell_font, CONTENT, y)
        h2 = draw_cell(col2_x, c2, cell_font, PRIMARY, y)
        y += max(row_h, max(h1, h2) + row_gap)

    footer = font(FONT_DEMI, 30)
    d.text((MARGIN, H - 148), "davevoyles.com", font=footer, fill=SECONDARY)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", default=str(ROOT / "scenes.json"))
    ap.add_argument("--outdir", default=str(ROOT / "work" / "cards"))
    args = ap.parse_args()

    scenes = json.loads(Path(args.scenes).read_text())["scenes"]
    outdir = Path(args.outdir)
    made = 0
    for s in scenes:
        beats = s["visual"]
        if isinstance(beats, dict):
            beats = [beats]
        for bi, v in enumerate(beats):
            out_path = outdir / f"{s['id']}-{bi}.png"
            if v["type"] == "card":
                out = render_card(s["headline"], v["text"], out_path)
            elif v["type"] == "table":
                out = render_table(s["headline"], v["headers"], v["rows"], out_path)
            else:
                continue
            print(f"{s['id']}-{bi:<14} {out}")
            made += 1
    print(f"rendered {made} cards -> {outdir}")


if __name__ == "__main__":
    main()
