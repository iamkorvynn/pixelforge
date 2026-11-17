#!/usr/bin/env node
// Headless smoke test: starts the static server, fetches the page, and
// confirms the editor entry point, stylesheets, sample images and every
// bundled recipe are reachable. Run with: npm run smoke
import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4199;
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn(process.execPath, ['scripts/serve.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}`);
  if (!ok) failures += 1;
};

async function get(p) {
  const res = await fetch(`${BASE}${p}`);
  return { status: res.status, text: await res.text() };
}

try {
  // Wait for the server to answer.
  let up = false;
  for (let i = 0; i < 30 && !up; i++) {
    try { const r = await fetch(BASE + '/'); up = r.ok; } catch { await sleep(200); }
  }
  check(up, 'server responds on /');

  const home = await get('/');
  check(home.status === 200, 'index.html returns 200');
  check(home.text.includes('<canvas id="editor-canvas"'), 'page contains the editor canvas');
  check(home.text.includes('js/main.js'), 'page loads js/main.js');
  check(home.text.includes('css/main.css'), 'page loads css/main.css');
  check(home.text.includes('PixelForge'), 'page mentions PixelForge');

  const mainJs = await get('/js/main.js');
  check(mainJs.status === 200 && mainJs.text.length > 200, 'js/main.js serves');

  const css = await get('/css/main.css');
  check(css.status === 200 && css.text.length > 200, 'css/main.css serves');

  const samples = await readdir(path.join(root, 'samples'));
  check(samples.length > 0, `${samples.length} sample image(s) listed`);
  for (const s of samples) {
    const r = await fetch(`${BASE}/samples/${s}`);
    check(r.status === 200 && r.headers.get('content-type') === 'image/png', `sample serves: ${s}`);
  }

  const recipes = await readdir(path.join(root, 'recipes'));
  for (const r of recipes) {
    const res = await get(`/recipes/${r}`);
    let parsed = null;
    try { parsed = JSON.parse(res.text); } catch { /* handled below */ }
    check(res.status === 200 && parsed && parsed.kind === 'pixelforge-recipe', `recipe serves + parses: ${r}`);
  }

  // Spot-check that a core module serves and exports the expected symbol.
  const pixel = await get('/js/core/pixel.js');
  check(pixel.status === 200 && pixel.text.includes('applyAdjustments'), 'js/core/pixel.js serves with applyAdjustments');
} finally {
  server.kill();
}

if (failures > 0) {
  console.error(`\nSmoke test FAILED (${failures} check(s)).`);
  process.exit(1);
}
console.log('\nSmoke test OK — app serves and all key assets are present.');
