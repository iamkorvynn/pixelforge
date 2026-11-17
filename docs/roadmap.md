# Roadmap

Ideas that fit PixelForge's "runs anywhere, no dependencies" rule. Nothing here is promised — this is the backlog, in rough priority order.

## Next

- **Batch export** — apply the current recipe to several images and download them as a zip (still client-side; zip written by hand).
- **More sample photos** — the generator script makes adding one cheap; aim for a dozen.
- **Recipe gallery page** — a static page that renders every bundled recipe on the same sample, so people can pick a look before opening the editor.
- **Straighten guides** — overlay a horizon line while straightening.

## Later

- **Local contrast (CLAHE)** — a genuinely better clarity than the current unsharp blend.
- **Curves editor** — a small RGB curves panel (the one adjustment missing).
- **Selective edits** — brush a mask and apply adjustments to part of the image.
- **HEIC/RAW preview** — decode via the browser where supported, with an honest "unsupported" fallback elsewhere.

## Never (out of scope)

- Accounts, cloud sync, or any server.
- AI auto-enhance (needs a model or a server — contradicts the premise).
- A framework or bundler. The zero-dependency static build is the point.
