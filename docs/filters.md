# Filters

Every PixelForge filter is implemented by hand in `js/filters/` — one module per filter, no libraries, no CSS tricks. Filters run on the raw RGBA buffer, so what you see is exactly what gets exported.

## Colour filters (per-pixel)

| Filter | What it does |
| --- | --- |
| Grayscale | Replaces each pixel with its Rec. 601 luminance. |
| Sepia | Luminance mapped through the classic warm-brown matrix. |
| Vintage | Faded film: blacks lifted, contrast compressed, warm cast. |
| Invert | Photographic negative (`255 - v` per channel). |
| Noir | High-contrast black & white via an S-curve on luminance. |
| Fade | Matte wash: blacks raised, whites compressed, cool tint. |
| Duotone | Luminance mapped onto a two-colour gradient (deep blue → warm paper). |
| Warm / Cool | Golden-hour or icy cast by scaling channels. |
| Solarize | Tones above the threshold flip (darkroom solarisation). Strength = threshold 0–255. |
| Threshold | Hard black & white at a luminance cutoff. Strength = cutoff 0–255. |

## Convolution filters (3×3 kernels)

| Filter | Kernel |
| --- | --- |
| Blur | Gaussian 3×3, repeated 1–5 times. Strength = passes. |
| Sharpen | Classic sharpen kernel; strength 2 uses the stronger variant. |
| Emboss | Zero-sum emboss kernel + 128 bias, averaged to grey. |
| Outline | Laplacian edge detection, inverted for a pencil-sketch look. |

## Spatial / blend filters

| Filter | What it does |
| --- | --- |
| Vignette | Darkens corners by distance from centre (`d^2.2` falloff). Strength 0–100. |
| Posterize | Reduces colour depth to N steps per channel. Strength = levels 2–8. |
| Grain | Deterministic per-pixel noise (seeded by position, so exports are reproducible). Strength 0–100. |
| Clarity | Local contrast: blends the image with its sharpened version. Strength 0–100. |

## Order matters

Filters apply in the order they appear in the chip row — top to bottom in a recipe's `filters` array. `sepia` then `vignette` is not the same as `vignette` then `sepia` (in practice the difference is subtle, but the pipeline is strictly sequential).
