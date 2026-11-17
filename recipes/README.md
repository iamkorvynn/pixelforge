# Bundled recipes

Eight ready-made looks, each a single JSON file you can import by pasting its contents into the Recipes panel (or by copying the text from the file). See [`docs/recipes.md`](../docs/recipes.md) for the format.

| Recipe | What it is |
| --- | --- |
| `arctic.json` | Arctic — icy blues, crisp and clean. |
| `bright-and-airy.json` | Bright & Airy — lifted exposure, gentle warmth. |
| `golden-hour.json` | Golden Hour — warm, glowing, high vibrance. |
| `moody.json` | Moody — dark, low-key, desaturated, vignetted. |
| `noir.json` | Noir — hard black & white with a vignette frame. |
| `poster-pop.json` | Poster Pop — flat graphic poster colours. |
| `soft-skin.json` | Soft Skin — gentle warmth, softened contrast. |
| `vintage-film.json` | Vintage Film — faded 70s film with lifted blacks. |

Every file in this folder is validated by `npm run build` and exercised against a real sample image by `python3 scripts/verify-all-recipes.py`.
