#!/usr/bin/env node
// PixelForge build step.
// The app is pure static (vanilla JS + canvas, zero dependencies), so there is
// nothing to bundle. The build validates every JS module parses, every asset
// referenced by index.html exists on disk, and the sample images are present.
import { readdir, readFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function jsFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await jsFiles(p, out);
    else if (p.endsWith('.js') || p.endsWith('.mjs')) out.push(p);
  }
  return out;
}

let failures = 0;
const fail = (msg) => { failures += 1; console.error(`  ✗ ${msg}`); };

// 1. Syntax-check every JS file.
const files = await jsFiles(path.join(root, 'js'));
const scripts = [path.join(root, 'scripts', 'build.mjs'), path.join(root, 'scripts', 'serve.mjs'), path.join(root, 'scripts', 'smoke.mjs')];
const testFiles = await jsFiles(path.join(root, 'tests'));
console.log(`Checking ${files.length + scripts.length + testFiles.length} JS files…`);
for (const f of [...files, ...scripts, ...testFiles]) {
  try {
    await run(process.execPath, ['--check', f]);
  } catch {
    fail(`syntax error in ${path.relative(root, f)}`);
  }
}

// 2. Every local asset referenced by index.html must exist.
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !u.startsWith('http') && !u.startsWith('#') && !u.startsWith('data:'));
console.log(`Checking ${refs.length} asset references in index.html…`);
for (const ref of new Set(refs)) {
  try {
    await stat(path.join(root, ref));
  } catch {
    fail(`missing asset referenced by index.html: ${ref}`);
  }
}

// 3. Sample images must exist and be non-empty.
const samples = await readdir(path.join(root, 'samples'));
if (samples.length === 0) fail('no sample images in samples/');
for (const s of samples) {
  const st = await stat(path.join(root, 'samples', s));
  if (st.size < 1000) fail(`sample image suspiciously small: ${s}`);
}
console.log(`Found ${samples.length} sample images.`);

// 4. Recipe JSON files must parse.
const recipeDir = path.join(root, 'recipes');
const recipeFiles = (await readdir(recipeDir)).filter((f) => f.endsWith('.json'));
for (const r of recipeFiles) {
  try {
    JSON.parse(await readFile(path.join(recipeDir, r), 'utf8'));
  } catch {
    fail(`invalid recipe JSON: ${r}`);
  }
}
console.log(`Checked ${recipeFiles.length} bundled recipes.`);

if (failures > 0) {
  console.error(`\nBuild FAILED with ${failures} problem(s).`);
  process.exit(1);
}
console.log('\nBuild OK — pure static app, all modules parse, all assets present.');
