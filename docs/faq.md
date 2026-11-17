# FAQ

## Do my photos leave my computer?
No. PixelForge is a static page. There is no server, no upload, no analytics. Everything happens in your browser tab.

## What image formats can I open?
Anything your browser can decode as an image: PNG, JPEG, WebP, GIF, AVIF, BMP. Export is PNG, JPEG, or WebP.

## How big an image can I edit?
There is no hard limit, but the pipeline runs per pixel in JavaScript, so very large photos (e.g. 40 MP phone shots) will feel slow on slider drags. 12–24 MP is comfortable; for bigger files, export at 0.5× scale.

## Why does the histogram show the original, not the edited image?
The histogram is computed from the working image (after crop/rotate, before sliders/filters) so it stays a stable reference while you edit. The status bar's pipeline description tells you what edits are active.

## I pasted a recipe and got an error — what now?
The import error names the problem: not valid JSON, wrong `kind`, unsupported version, unknown adjustment, or unknown filter id. Check the pasted text is the whole recipe (recipes are one line of JSON) and that it came from PixelForge.

## Can I use a recipe from an older version?
Recipes are versioned. Version 1 is the only version that exists today; if a future version ships, the importer will say so explicitly rather than misreading it.

## Does PixelForge work offline?
Yes, once the page is loaded. There are no network requests at all after the initial load (and no CDN assets).

## Why is there no AI / auto-enhance?
Deliberately out of scope: this editor is about hand-built pixel math you can read and test. Auto-enhance would need either a model or a server — both contradict the "runs anywhere, no dependencies" goal.
