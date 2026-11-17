// Recipes — the PixelForge twist. A recipe is a named, portable bundle of
// adjustments + filter steps, stored as JSON so it can be copied, pasted,
// shared as text, or saved as a .json file.
//
// Format:
//   { "kind": "pixelforge-recipe", "version": 1, "name": "Golden Hour",
//     "adjustments": { "brightness": 10, ... }, "filters": [{ "id": "warm" }] }
import { DEFAULT_ADJUSTMENTS } from './pixel.js';
import { getFilter } from '../filters/index.js';

export const RECIPE_KIND = 'pixelforge-recipe';
export const RECIPE_VERSION = 1;

export function createRecipe(name, adjustments, filters = []) {
  return {
    kind: RECIPE_KIND,
    version: RECIPE_VERSION,
    name: String(name || 'Untitled recipe').slice(0, 80),
    createdAt: new Date().toISOString(),
    adjustments: { ...DEFAULT_ADJUSTMENTS, ...adjustments },
    filters: filters.map((f) => ({ id: f.id, ...(f.strength !== undefined ? { strength: f.strength } : {}) })),
  };
}

// Serialize a recipe to a compact single-line JSON string (easy to copy).
export function serializeRecipe(recipe) {
  return JSON.stringify(recipe);
}

// Pretty-print for saving to a file.
export function serializeRecipePretty(recipe) {
  return JSON.stringify(recipe, null, 2);
}

// Parse + validate pasted recipe text. Throws a helpful Error on bad input.
export function parseRecipe(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That does not look like a recipe — it is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Recipe must be a JSON object.');
  if (parsed.kind !== RECIPE_KIND) throw new Error(`Unknown recipe kind: ${parsed.kind ?? '(missing)'}. Expected "${RECIPE_KIND}".`);
  if (parsed.version !== RECIPE_VERSION) throw new Error(`Unsupported recipe version: ${parsed.version}. This app reads version ${RECIPE_VERSION}.`);

  const adjustments = { ...DEFAULT_ADJUSTMENTS };
  for (const [key, value] of Object.entries(parsed.adjustments || {})) {
    if (!(key in DEFAULT_ADJUSTMENTS)) throw new Error(`Unknown adjustment: ${key}`);
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Adjustment ${key} must be a number.`);
    adjustments[key] = key === 'hue' ? Math.max(-180, Math.min(180, value)) : Math.max(-100, Math.min(100, value));
  }

  const filters = [];
  for (const step of parsed.filters || []) {
    if (!step || typeof step.id !== 'string') throw new Error('Each filter step needs an "id".');
    if (!getFilter(step.id)) throw new Error(`Unknown filter: ${step.id}`);
    filters.push({ id: step.id, ...(typeof step.strength === 'number' ? { strength: step.strength } : {}) });
  }

  return {
    kind: RECIPE_KIND,
    version: RECIPE_VERSION,
    name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.slice(0, 80) : 'Imported recipe',
    createdAt: parsed.createdAt || new Date().toISOString(),
    adjustments,
    filters,
  };
}

// Round-trip helper used by tests and the UI: serialize then parse.
export function roundTrip(recipe) {
  return parseRecipe(serializeRecipe(recipe));
}

// Deep-link support: ?recipe=<urlencoded recipe JSON> loads a shared look
// on start. Returns the parsed recipe, or null when no recipe is present.
export function recipeFromUrl(search) {
  const params = new URLSearchParams(search);
  const raw = params.get('recipe');
  if (!raw) return null;
  return parseRecipe(raw);
}

// Build a shareable deep link for a recipe (same origin, no server needed).
export function recipeToUrl(base, recipe) {
  const params = new URLSearchParams({ recipe: serializeRecipe(recipe) });
  return `${base}?${params.toString()}`;
}
