#!/usr/bin/env python3
"""Generate PixelForge's bundled sample photos.

All six are original abstract/gradient art drawn with PIL — no copyrighted
photos, no downloaded assets. Run: python3 scripts/generate-samples.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "samples"
OUT.mkdir(exist_ok=True)
W, H = 1200, 800


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(top, bottom):
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        c = lerp(top, bottom, y / H)
        for x in range(W):
            px[x, y] = c
    return img


def sunset_gradient():
    img = vertical_gradient((255, 183, 71), (255, 94, 58))
    d = ImageDraw.Draw(img)
    # sun
    d.ellipse([W // 2 - 130, 300, W // 2 + 130, 560], fill=(255, 240, 200))
    # horizon bands
    for i, y in enumerate(range(560, H, 46)):
        d.rectangle([0, y, W, y + 14], fill=lerp((255, 120, 80), (120, 40, 90), i / 6))
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img.save(OUT / "sunset-gradient.png")


def mountain_dusk():
    img = vertical_gradient((38, 48, 96), (214, 128, 96))
    d = ImageDraw.Draw(img)
    random.seed(7)
    # moon
    d.ellipse([930, 90, 1010, 170], fill=(245, 240, 220))
    # ridges, far to near
    for layer, base, col in [(0.55, 430, (72, 66, 110)), (0.68, 520, (52, 48, 88)), (0.82, 620, (34, 32, 64))]:
        pts = [(0, H)]
        x = 0
        while x < W:
            pts.append((x, base - random.randint(60, 200) * layer))
            x += random.randint(90, 200)
        pts += [(W, H)]
        d.polygon(pts, fill=col)
    img.save(OUT / "mountain-dusk.png")


def ocean_waves():
    img = vertical_gradient((10, 90, 140), (4, 40, 80))
    d = ImageDraw.Draw(img)
    random.seed(11)
    for band in range(14):
        y0 = 60 + band * 52
        amp = 26 + band * 2
        pts = []
        for x in range(0, W + 20, 20):
            pts.append((x, y0 + amp * math.sin(x / 180 + band)))
        col = lerp((20, 140, 190), (160, 220, 240), band / 14)
        for i in range(len(pts) - 1):
            d.line([pts[i], pts[i + 1]], fill=col, width=7)
    # sun glints
    for _ in range(60):
        x = random.randint(0, W)
        y = random.randint(120, H - 40)
        d.ellipse([x, y, x + 14, y + 3], fill=(220, 240, 250))
    img.save(OUT / "ocean-waves.png")


def forest_mist():
    img = vertical_gradient((180, 205, 190), (60, 90, 70))
    d = ImageDraw.Draw(img)
    random.seed(21)
    for i in range(46):
        x = random.randint(0, W)
        wdt = random.randint(10, 30)
        top = random.randint(0, 200)
        shade = random.randint(30, 70)
        d.rectangle([x, top, x + wdt, H], fill=(shade, shade + 25, shade + 10))
        # canopy blobs
        d.ellipse([x - 40, top - 40, x + wdt + 40, top + 60], fill=(shade + 10, shade + 45, shade + 20))
    mist = Image.new("RGB", (W, H), (210, 225, 215))
    img = Image.blend(img, mist, 0.28)
    img.save(OUT / "forest-mist.png")


def city_neon():
    img = Image.new("RGB", (W, H), (12, 10, 28))
    d = ImageDraw.Draw(img)
    random.seed(33)
    x = 0
    while x < W:
        bw = random.randint(70, 150)
        bh = random.randint(220, 620)
        col = (random.randint(18, 40), random.randint(16, 34), random.randint(40, 70))
        d.rectangle([x, H - bh, x + bw, H], fill=col)
        # lit windows
        for wy in range(H - bh + 16, H - 16, 26):
            for wx in range(x + 10, x + bw - 12, 22):
                if random.random() < 0.45:
                    d.rectangle([wx, wy, wx + 10, wy + 12],
                                fill=random.choice([(255, 90, 160), (80, 220, 255), (255, 210, 90), (140, 255, 170)]))
        x += bw + random.randint(4, 18)
    # neon horizon glow
    d.rectangle([0, H - 8, W, H], fill=(255, 60, 140))
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    img.save(OUT / "city-neon.png")


def desert_dunes():
    img = vertical_gradient((255, 214, 150), (190, 120, 60))
    d = ImageDraw.Draw(img)
    random.seed(5)
    # sun
    d.ellipse([880, 110, 1000, 230], fill=(255, 244, 200))
    for layer, y0, col in [(0, 470, (232, 170, 95)), (1, 560, (214, 146, 72)), (2, 660, (190, 122, 54))]:
        pts = [(0, H)]
        for x in range(0, W + 40, 40):
            pts.append((x, y0 + 60 * math.sin(x / 260 + layer * 1.7)))
        pts += [(W, H)]
        d.polygon(pts, fill=col)
    img.save(OUT / "desert-dunes.png")


if __name__ == "__main__":
    for fn in (sunset_gradient, mountain_dusk, ocean_waves, forest_mist, city_neon, desert_dunes):
        fn()
        print("generated", fn.__name__)
    print("samples in", OUT)
