"""Draws a 1200x630 link-preview card for each report: assets/img/cards/<id>.png.

Called by tools/build-pages.mjs, which passes the reports as JSON on stdin. The card sits on
the site's own preview background (assets/img/og-card.png) and shows the company, ticker,
rating, 12-month target and upside, in the site's colours.

Needs Pillow (pip install pillow). Fonts are the Windows system fonts Georgia, Segoe UI and
Consolas; on another OS, set PELAGIC_FONT_DIR to a folder that holds those .ttf files.
"""

import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "cards"
FONT_DIR = Path(os.environ.get("PELAGIC_FONT_DIR", r"C:\Windows\Fonts"))

W, H = 1200, 630
PAPER = (251, 249, 243)       # --raised
SHADE = (235, 230, 216)       # --shade
INK = (22, 24, 29)            # --ink
MUTED = (98, 95, 87)          # --muted
PEN = (47, 53, 214)           # --brand-deep
RATING_INK = {
    "Buy": (29, 131, 72),
    "Accumulate": (79, 125, 18),
    "Hold": (154, 107, 0),
    "Sell": (192, 57, 43),
}
SECTORS = {"marine": "Marine", "energy": "Energy", "sustainability": "Sustainability"}
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
CURRENCY = {"USD": "$", "EUR": "€", "GBP": "£", "NOK": "NOK "}

# Panel geometry: a raised sheet over the topographic background, with a second sheet peeking out.
PANEL = (72, 58, 1128, 566)
PAD = 56


def font(name, size):
    return ImageFont.truetype(str(FONT_DIR / name), size)


def spaced(draw, xy, text, fnt, fill, tracking=3, anchor_right=False):
    """Draws letter-spaced small caps, like the site's labels."""
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x, y = xy
    if anchor_right:
        x -= total
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += w + tracking
    return total


def fit(draw, text, name, size, max_width, min_size=40):
    """Largest font size (down to min_size) at which the text fits the width."""
    while size > min_size and draw.textlength(text, font=font(name, size)) > max_width:
        size -= 2
    return font(name, size)


def upside(r):
    if isinstance(r.get("upside"), (int, float)):
        return float(r["upside"])
    price, target = r.get("price"), r.get("target")
    if price and target:
        return round((target / price - 1) * 100, 1)
    return None


def long_date(iso):
    y, m, d = (int(p) for p in iso.split("-"))
    return f"{MONTHS[m - 1]} {d}, {y}"


def manta_mark(height):
    """The site's manta mark, recoloured from white to ink."""
    mark = Image.open(ROOT / "assets" / "img" / "mark-white-large.png").convert("RGBA")
    alpha = mark.getchannel("A")
    inked = Image.new("RGBA", mark.size, INK + (0,))
    inked.putalpha(alpha)
    inked = inked.crop(inked.getbbox())
    width = round(inked.width * height / inked.height)
    return inked.resize((width, height), Image.LANCZOS)


def double_rule(draw, y, x0, x1):
    draw.line([(x0, y), (x1, y)], fill=INK, width=1)
    draw.line([(x0, y + 4), (x1, y + 4)], fill=INK, width=1)


def card(r):
    img = Image.open(ROOT / "assets" / "img" / "og-card.png").convert("RGB")
    draw = ImageDraw.Draw(img)
    x0, y0, x1, y1 = PANEL
    draw.rectangle((x0 + 10, y0 + 10, x1 + 10, y1 + 10), fill=SHADE, outline=INK, width=1)
    draw.rectangle(PANEL, fill=PAPER, outline=INK, width=2)
    left, right = x0 + PAD, x1 - PAD

    # Masthead: mark and name on the left, sector and date on the right, over a double rule.
    mark = manta_mark(40)
    img.paste(mark, (left, y0 + 36), mark)
    spaced(draw, (left + mark.width + 16, y0 + 44), "PELAGIC RESEARCH", font("seguisb.ttf", 19), INK, tracking=4)
    meta = f"{SECTORS.get(r.get('sector'), '').upper()} · {long_date(r['date']).upper()}"
    spaced(draw, (right, y0 + 47), meta, font("consola.ttf", 17), MUTED, tracking=1, anchor_right=True)
    double_rule(draw, y0 + 100, left, right)

    # Company and ticker.
    company = r.get("company") or r.get("title", "")
    draw.text((left, y0 + 132), company, font=fit(draw, company, "georgia.ttf", 78, right - left), fill=INK)
    draw.text((left, y0 + 236), r.get("ticker", ""), font=font("consola.ttf", 28), fill=PEN)

    # The call: rating, target and upside in three columns.
    double_rule(draw, y0 + 312, left, right)
    rating = r.get("rating", "")
    target = r.get("target")
    up = upside(r)
    sign = CURRENCY.get(r.get("currency") or "USD", f"{r.get('currency')} ")
    columns = [("RATING", rating, RATING_INK.get(rating, INK))]
    if target:
        columns.append(("12-MONTH TARGET", f"{sign}{target:,.2f}", INK))
    if up is not None:
        columns.append(("UPSIDE", f"{'+' if up > 0 else ''}{up:.1f}%", RATING_INK.get(rating, INK)))
    col_w = (right - left) / 3
    label_font = font("seguisb.ttf", 16)
    # One size for all three values, shrunk until the widest (e.g. "Accumulate") clears its column.
    widest = max((value for _, value, _ in columns), key=lambda v: draw.textlength(v, font=font("georgia.ttf", 60)))
    value_font = fit(draw, widest, "georgia.ttf", 60, col_w - 56)
    for i, (label, value, colour) in enumerate(columns):
        cx = left + i * col_w
        if i:
            draw.line([(cx - 24, y0 + 344), (cx - 24, y1 - 40)], fill=SHADE, width=2)
        spaced(draw, (cx, y0 + 346), label, label_font, MUTED, tracking=3)
        draw.text((cx, y0 + 378), value, font=value_font, fill=colour)
    return img


def main():
    reports = json.load(sys.stdin)
    OUT.mkdir(parents=True, exist_ok=True)
    wanted = {f"{r['id']}.png" for r in reports}
    for old in OUT.glob("*.png"):
        if old.name not in wanted:
            old.unlink()
    for r in reports:
        card(r).save(OUT / f"{r['id']}.png", optimize=True)
    print(f"Drew {len(reports)} preview cards in assets/img/cards/.")


if __name__ == "__main__":
    main()
