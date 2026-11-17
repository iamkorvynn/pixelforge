#!/usr/bin/env node
// Headless filter smoke test (Node half).
// Reads a raw RGBA file, runs the real PixelForge pipeline on it with a
// recipe, and writes the result back as raw RGBA.
// Usage: node scripts/filter-smoke.mjs <in.raw> <width> <height> <recipe.json> <out.raw>
import { readFile, writeFile } from 'node:fs/promises';
import { runPipeline } from '../js/core/pipeline.js';
import { parseRecipe } from '../js/core/recipes.js';

const [inPath, width, height, recipePath, outPath] = process.argv.slice(2);
const w = Number(width), h = Number(height);
const raw = await readFile(inPath);
if (raw.length !== w * h * 4) throw new Error(`expected ${w * h * 4} bytes, got ${raw.length}`);
const recipe = parseRecipe(await readFile(recipePath, 'utf8'));
const buf = { width: w, height: h, data: new Uint8ClampedArray(raw) };
const out = runPipeline(buf, recipe.adjustments, recipe.filters);
await writeFile(outPath, Buffer.from(out.data));
console.log(`filter-smoke: ${w}x${h} through recipe "${recipe.name}" (${recipe.filters.map((f) => f.id).join(', ') || 'no filters'})`);
