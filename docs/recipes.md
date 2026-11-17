# Recipes

A Recipe is PixelForge's way of saving a look and sharing it as text. It is a single JSON object:

```json
{
  "kind": "pixelforge-recipe",
  "version": 1,
  "name": "Golden Hour",
  "createdAt": "2026-11-18T00:00:00.000Z",
  "adjustments": {
    "brightness": 0, "contrast": 10, "saturation": 12, "hue": 0,
    "exposure": 0, "warmth": 35, "highlights": 10, "shadows": 0, "vibrance": 25
  },
  "filters": [{ "id": "warm" }]
}
```

## Fields

| Field | Meaning |
| --- | --- |
| `kind` | Always `"pixelforge-recipe"`. Anything else is rejected on import. |
| `version` | `1`. Future versions will be handled explicitly, never silently misread. |
| `name` | Display name, up to 80 characters. |
| `createdAt` | ISO timestamp, informational only. |
| `adjustments` | Any subset of the 9 slider keys. Missing keys default to 0. Values are clamped to −100…100 (hue −180…180) on import. |
| `filters` | Ordered list of `{ "id", "strength"? }` steps, applied in order. `strength` is optional and filter-specific (e.g. vignette 0–100, blur 1–5). |

## Adjustment keys

`brightness`, `contrast`, `saturation`, `hue`, `exposure`, `warmth`, `highlights`, `shadows`, `vibrance`.

## Filter ids

`grayscale`, `sepia`, `vintage`, `invert`, `noir`, `fade`, `duotone`, `warm`, `cool`, `vignette`, `blur`, `sharpen`, `posterize`, `outline`.

## Import rules

Import validates, in order: valid JSON → object → `kind` matches → `version` is 1 → every adjustment key is known and numeric → every filter id is known. The first failure stops the import with a plain-language error; a bad paste can never corrupt the editor state.

## Bundled recipes

`recipes/` ships 8 recipes you can import by pasting their contents into the Recipes panel: Bright & Airy, Vintage Film, Noir, Golden Hour, Moody, Arctic, Soft Skin, Poster Pop. They are also the reference examples for the format.
