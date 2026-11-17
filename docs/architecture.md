# Architecture

PixelForge is deliberately boring on purpose: static files, ES modules, no framework, no bundler, no dependencies. The whole app is a thin UI shell over a pure, tested pixel core.

## The render path

```
source image (pixels)
  → transform (rotate/flip)      js/core/transform.js
  → crop (destructive)           js/core/crop.js
  → working buffer
  → adjustments (per-pixel)      js/core/pixel.js
  → filter chain (in order)      js/filters/*.js
  → edited buffer
  → canvas (zoom/pan/compare)    js/ui/editor.js
```

Key decisions:

- **Pixels, not CSS filters.** Every adjustment and filter is computed on the raw RGBA buffer by hand. That is the point of the app: the math is the product. CSS `filter:` would be faster but would teach nothing and could not be exported.
- **State is data, not DOM.** `js/core/state.js` holds one plain object: `{ adjustments, filters, transform, crop, imageWidth, imageHeight }`. The UI renders from it, history snapshots it, recipes serialize it. Nothing in the core imports the DOM, so everything in `js/core/` is unit-testable in Node.
- **History snapshots state, never pixels.** Undo/redo stores 50 state objects. The image pixels live once in the editor. Undo is therefore instant and memory-cheap.
- **Crop is destructive.** Applying a crop replaces the source buffer with the cropped working buffer. Keeping crop as a live, non-destructive rect would mean re-deriving it through every rotation, and the extra complexity buys nothing for an editor of this size.
- **Render is coalesced.** Slider drags call `queueRender`, which renders at most once per animation frame. The pipeline runs at working resolution; for very large photos this is the honest bottleneck and the reason the status bar shows the image size.

## Module map

| Area | Files | Depends on |
| --- | --- | --- |
| Core math | `js/core/utils.js`, `color.js`, `convolution.js`, `pixel.js` | nothing |
| Composition | `js/core/pipeline.js`, `state.js`, `recipes.js`, `history.js`, `crop.js`, `transform.js`, `export.js` | core math, filter registry |
| Filters | `js/filters/*.js` + `index.js` | core math |
| Presets | `js/presets/*.js` + `index.js` | recipe format |
| UI | `js/ui/editor.js`, `sliders.js`, `presetsPanel.js`, `recipesPanel.js`, `toolbar.js`, `shortcuts.js`, `dialogs.js`, `upload.js`, `toast.js` | core + filters + presets |
| Bootstrap | `js/main.js` | everything above |

## The editor canvas

`js/ui/editor.js` owns three canvases:

1. `sourceCanvas` — the original upload, used to rebuild after transform/crop.
2. `workCanvas` — the transformed + cropped image (the "before" image for compare).
3. `editCanvas` — the pipeline output (the "after" image).

The visible canvas draws `editCanvas` scaled by the zoom factor and pan offset, on a checkerboard. Compare mode clips `workCanvas` to the left of the divider; crop mode draws a dimmed overlay with a rule-of-thirds grid and draggable handles.

## Recipes

A recipe is `{ kind: "pixelforge-recipe", version: 1, name, adjustments, filters }`. Parsing validates kind, version, every adjustment key and range, and every filter id — a pasted recipe can never crash the app. See `docs/recipes.md`.

## Tests

`tests/` uses Node's built-in `node:test` runner — no test framework to install. Tests cover the pure core only: pixel math on tiny arrays, convolution on known patterns, recipe round-trips and rejection cases, history invariants, crop/transform geometry, and export rules. The DOM layer is intentionally untested here; it is thin wiring over tested functions.
