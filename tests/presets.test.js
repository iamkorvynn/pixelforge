import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PRESETS, getPreset, presetToRecipe } from '../js/presets/index.js';
import { parseRecipe } from '../js/core/recipes.js';
import { listFilters } from '../js/filters/index.js';

test('every preset converts to a recipe that parses cleanly', () => {
  assert.ok(ALL_PRESETS.length >= 20, `expected 20+ presets, got ${ALL_PRESETS.length}`);
  for (const preset of ALL_PRESETS) {
    const recipe = presetToRecipe(preset);
    const parsed = parseRecipe(JSON.stringify(recipe));
    assert.equal(parsed.name, preset.name);
  }
});

test('preset ids are unique', () => {
  const ids = ALL_PRESETS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('getPreset finds presets and returns null for unknown ids', () => {
  assert.ok(getPreset('film-vintage'));
  assert.equal(getPreset('no-such-preset'), null);
});

test('every preset uses only known filters', () => {
  const known = new Set(listFilters().map((f) => f.id));
  for (const preset of ALL_PRESETS) {
    for (const step of preset.filters) {
      assert.ok(known.has(step.id), `preset ${preset.id} uses unknown filter ${step.id}`);
    }
  }
});

test('the filter registry lists all 14 hand-written filters', () => {
  const filters = listFilters();
  assert.equal(filters.length, 14);
  assert.ok(filters.some((f) => f.id === 'grayscale'));
  assert.ok(filters.some((f) => f.id === 'sharpen'));
  assert.ok(filters.some((f) => f.id === 'vignette'));
});
