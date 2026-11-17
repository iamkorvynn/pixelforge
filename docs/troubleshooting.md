# Troubleshooting

## The page is blank / the editor never loads
- Serve it over HTTP (`npm start`), not `file://` — ES modules are blocked from `file://` in some browsers.
- Check the browser console: a failed `js/main.js` import usually means a file is missing. Run `npm run build` — it checks every asset reference.

## My image won't open
- The file must be an image your browser can decode. Try opening it in a plain browser tab first.
- Very large images (100+ MB) can exhaust the tab's memory; resize a copy and try again.

## Sliders feel laggy
- The pipeline runs per pixel at full resolution. Halve the image first (export at 0.5×, re-open), or crop to the area you care about before fine-tuning sliders.

## Export downloads a tiny/black file
- Make sure an image is loaded (the empty state should be gone). If the canvas shows the image but the export is black, the image likely has an alpha channel with transparency — export as PNG, which preserves it.

## A recipe import fails with "Unknown filter"
- The recipe references a filter id this version doesn't know. Check the pasted text wasn't truncated, and that the recipe came from PixelForge (not another app with a similar format).

## Crop handles don't respond
- Crop mode must be on (the Crop button in the toolbar, or `C`). Handles are the white squares on the crop border; drag inside the rect to move it, drag a handle to resize.

## Undo doesn't undo my slider drag
- History is pushed when you release a slider, not on every tick — one drag is one undo step, by design. If a drag never released (pointer left the window), click the slider once and release.
