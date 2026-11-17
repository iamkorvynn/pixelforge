import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecipe, serializeRecipe, parseRecipe, roundTrip, recipeFromUrl, recipeToUrl, RECIPE_KIND } from '../js/core/recipes.js';
import { DEFAULT_ADJUSTMENTS } from '../js/core/pixel.js';

const sample = () => createRecipe('Golden Hour', { warmth: 30, saturation: 15 }, [{ id: 'warm' }, { id: 'vignette', strength: 40 }]);

test('serialize + parse round-trips a recipe exactly', () => {
  const recipe = sample();
  const back = roundTrip(recipe);
  assert.equal(back.kind, RECIPE_KIND);
  assert.equal(back.name, 'Golden Hour');
  assert.equal(back.adjustments.warmth, 30);
  assert.equal(back.adjustments.saturation, 15);
  assert.equal(back.adjustments.brightness, 0); // untouched adjustments default to 0
  assert.deepEqual(back.filters, [{ id: 'warm' }, { id: 'vignette', strength: 40 }]);
});

test('serialize produces a single-line JSON string (easy to copy/paste)', () => {
  const text = serializeRecipe(sample());
  assert.equal(typeof text, 'string');
  assert.ok(!text.includes('\n'));
  assert.ok(text.includes('pixelforge-recipe'));
});

test('parse rejects text that is not JSON', () => {
  assert.throws(() => parseRecipe('not json at all'), /not valid JSON/);
});

test('parse rejects a recipe of the wrong kind', () => {
  assert.throws(() => parseRecipe(JSON.stringify({ kind: 'other-app', version: 1 })), /Unknown recipe kind/);
});

test('parse rejects an unsupported version', () => {
  assert.throws(() => parseRecipe(JSON.stringify({ kind: RECIPE_KIND, version: 99 })), /Unsupported recipe version/);
});

test('parse rejects an unknown adjustment key', () => {
  assert.throws(
    () => parseRecipe(JSON.stringify({ kind: RECIPE_KIND, version: 1, name: 'x', adjustments: { clarity: 10 }, filters: [] })),
    /Unknown adjustment/,
  );
});

test('parse rejects an unknown filter id', () => {
  assert.throws(
    () => parseRecipe(JSON.stringify({ kind: RECIPE_KIND, version: 1, name: 'x', adjustments: {}, filters: [{ id: 'nope' }] })),
    /Unknown filter/,
  );
});

test('parse clamps out-of-range adjustment values instead of failing', () => {
  const parsed = parseRecipe(JSON.stringify({
    kind: RECIPE_KIND, version: 1, name: 'Wild',
    adjustments: { brightness: 500, hue: -999 }, filters: [],
  }));
  assert.equal(parsed.adjustments.brightness, 100);
  assert.equal(parsed.adjustments.hue, -180);
});

test('createRecipe defaults missing adjustments to neutral', () => {
  const recipe = createRecipe('Minimal', { contrast: 20 });
  assert.deepEqual(recipe.adjustments, { ...DEFAULT_ADJUSTMENTS, contrast: 20 });
  assert.deepEqual(recipe.filters, []);
});

test('createRecipe truncates over-long names', () => {
  const recipe = createRecipe('x'.repeat(200), {});
  assert.ok(recipe.name.length <= 80);
});

test('recipeFromUrl parses a recipe from a query string', () => {
  const recipe = sample();
  const params = new URLSearchParams({ recipe: serializeRecipe(recipe) });
  const back = recipeFromUrl(`?${params.toString()}`);
  assert.equal(back.name, 'Golden Hour');
  assert.equal(back.adjustments.warmth, 30);
});

test('recipeFromUrl returns null with no recipe param', () => {
  assert.equal(recipeFromUrl('?foo=bar'), null);
  assert.equal(recipeFromUrl(''), null);
});

test('recipeFromUrl throws on a malformed recipe in the URL', () => {
  assert.throws(() => recipeFromUrl('?recipe=%7Bbad%20json'), /not valid JSON/);
});

test('recipeToUrl round-trips through recipeFromUrl', () => {
  const recipe = sample();
  const url = recipeToUrl('https://example.com/', recipe);
  const back = recipeFromUrl(new URL(url).search);
  assert.equal(back.name, 'Golden Hour');
});
