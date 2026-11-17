#!/usr/bin/env python3
"""Headless filter smoke test (Python half).

Decodes a bundled sample PNG with PIL, hands the raw pixels to the real
PixelForge pipeline (scripts/filter-smoke.mjs), re-encodes the result, and
checks the output actually changed in the expected direction.

Usage: python3 scripts/filter-smoke.py [sample.png] [recipe.json]
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SAMPLE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "samples" / "sunset-gradient.png"
RECIPE = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "recipes" / "golden-hour.json"

img = Image.open(SAMPLE).convert("RGBA")
w, h = img.size
raw_in = Path("/tmp/pf-smoke-in.raw")
raw_out = Path("/tmp/pf-smoke-out.raw")
raw_in.write_bytes(img.tobytes())

subprocess.run(
    ["node", str(ROOT / "scripts" / "filter-smoke.mjs"),
     str(raw_in), str(w), str(h), str(RECIPE), str(raw_out)],
    check=True,
)

before = np.frombuffer(img.tobytes(), dtype=np.uint8).reshape(h, w, 4).astype(float)
after = np.frombuffer(raw_out.read_bytes(), dtype=np.uint8).reshape(h, w, 4).astype(float)

recipe = json.loads(RECIPE.read_text())
mean_before = before[..., :3].mean(axis=(0, 1))
mean_after = after[..., :3].mean(axis=(0, 1))
changed = float(np.abs(after[..., :3] - before[..., :3]).mean())

print(f"sample:  {SAMPLE.name} {w}x{h}")
print(f"recipe:  {recipe['name']}")
print(f"mean RGB before: {mean_before.round(1)}")
print(f"mean RGB after:  {mean_after.round(1)}")
print(f"mean abs pixel change: {changed:.2f}")

# Golden Hour should warm the image: red up relative to blue.
assert changed > 1, "pipeline produced no visible change — filter did not run"
warm_before = mean_before[0] - mean_before[2]
warm_after = mean_after[0] - mean_after[2]
assert warm_after > warm_before, "golden-hour recipe should increase red-minus-blue"
print("filter smoke test OK — real pipeline changed a real sample image as expected")
