#!/usr/bin/env python3
"""Verify every bundled recipe against a real sample image.

Runs each recipes/*.json through the real PixelForge pipeline (via
scripts/filter-smoke.mjs) on samples/sunset-gradient.png and asserts the
output pixels actually change. Usage: python3 scripts/verify-all-recipes.py
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SAMPLE = ROOT / "samples" / "sunset-gradient.png"

img = Image.open(SAMPLE).convert("RGBA")
w, h = img.size
raw_in = Path("/tmp/pf-verify-in.raw")
raw_out = Path("/tmp/pf-verify-out.raw")
raw_in.write_bytes(img.tobytes())
before = np.frombuffer(img.tobytes(), dtype=np.uint8).reshape(h, w, 4).astype(float)

recipes = sorted((ROOT / "recipes").glob("*.json"))
print(f"{len(recipes)} bundled recipes x {SAMPLE.name} ({w}x{h})")
failures = 0
for recipe_path in recipes:
    recipe = json.loads(recipe_path.read_text())
    subprocess.run(
        ["node", str(ROOT / "scripts" / "filter-smoke.mjs"),
         str(raw_in), str(w), str(h), str(recipe_path), str(raw_out)],
        check=True, capture_output=True,
    )
    after = np.frombuffer(raw_out.read_bytes(), dtype=np.uint8).reshape(h, w, 4).astype(float)
    change = float(np.abs(after[..., :3] - before[..., :3]).mean())
    ok = change > 0.5
    print(f"  {'✓' if ok else '✗'} {recipe['name']:<16} mean abs change {change:6.2f}")
    if not ok:
        failures += 1

if failures:
    print(f"FAILED: {failures} recipe(s) produced no visible change")
    sys.exit(1)
print("All bundled recipes verified — each one visibly changes the image.")
