# PixelForge

A photo editor built **from scratch** in the browser — vanilla JavaScript + canvas, zero dependencies, no build step, no tracking, no server. Open an image, tune it, and export it. Everything runs locally in your browser; your photos never leave your machine.

## The twist: Recipes

Any look you build — sliders + filters — can be saved as a named **Recipe**, a small JSON document. Recipes are plain text, so you can:

- **Copy** the current look and paste it into any chat, doc, or comment
- **Import** a recipe someone shares with you by pasting the JSON back in
- **Download** recipes as `.json` files and keep a library in `localStorage`
- Start from one of the 8 bundled recipes in [`recipes/`](recipes/)

A recipe looks like this:

```json
{"kind":"pixelforge-recipe","version":1,"name":"Golden Hour","adjustments":{"warmth":35,"vibrance":25,"saturation":12,"highlights":10,"contrast":10},"filters":[{"id":"warm"}]}
```

## Features

- **Upload** an image (file picker, drag & drop, or paste from clipboard) — or start from one of the 6 bundled sample photos (original abstract art generated for this app, no copyrighted photos)
- **Adjustments** — 9 sliders: exposure, brightness, contrast, highlights, shadows, saturation, vibrance, warmth, hue shift
- **14 hand-written filters** — grayscale, sepia, vintage, invert, noir, fade, duotone, warm, cool, vignette, blur, sharpen, posterize, outline. Blur/sharpen are real 3×3 convolution kernels, written by hand
- **21 presets** in 5 packs (Classic, Film, Mono, Vivid, Portrait)
- **Crop** with draggable handles, rule-of-thirds grid, and aspect presets (1:1, 4:3, 3:2, 16:9, 9:16, 3:4)
- **Rotate** 90° and **flip** horizontal/vertical
- **Undo / redo** history (50 states, Ctrl+Z / Ctrl+Shift+Z)
- **Zoom + pan** — mouse wheel zooms at the cursor, drag to pan, fit-to-view, 100%
- **Before/after compare** — drag the split slider across the image, or hold `B` to peek at the original
- **Export** PNG (lossless), JPEG, or WebP at chosen quality, full resolution
- **Keyboard shortcuts** for everything — press `?` in the app for the list

## Run it

No install, no build. Any static server works:

```bash
npm start          # serves http://localhost:4173
# or
python3 -m http.server 4173
```

Then open http://localhost:4173 in a browser. You can also just open `index.html` directly — everything is relative paths — but a local server is recommended so module loading behaves the same everywhere.

## Develop & verify

```bash
npm test           # 91 unit tests (Node's built-in runner, no deps)
npm run build      # validates: every JS module parses, every asset exists, recipes parse
npm run smoke      # headless check: serves the app, fetches the page, samples and recipes
```

## Project layout

```
index.html            App shell: toolbar, sidebar, canvas, dialogs
css/                  One stylesheet per concern (layout, sliders, presets, recipes, dialogs)
js/main.js            Bootstrap: wires editor, panels, toolbar, history, shortcuts
js/core/              Pure, tested logic: pixel math, colour, convolution, pipeline,
                      recipes, history, crop, transform, state, export
js/filters/           One module per hand-written filter + registry
js/presets/           Five preset packs + registry
js/ui/                Editor (canvas/zoom/pan/crop/compare), panels, toolbar, dialogs
samples/              6 generated abstract sample photos (PIL, scripts/generate-samples.py)
recipes/              8 bundled shareable recipes
tests/                Unit tests for the pure logic (node:test)
scripts/              build / serve / smoke / generate-samples
docs/                 Shortcuts, recipes format, architecture
```

See [`docs/architecture.md`](docs/architecture.md) for how the render pipeline works, and [`docs/recipes.md`](docs/recipes.md) for the recipe format.

## Privacy

PixelForge has no backend, no analytics, and no network calls at all. Images you open are processed in memory in your own browser tab.

## License

MIT — see [LICENSE](LICENSE).
