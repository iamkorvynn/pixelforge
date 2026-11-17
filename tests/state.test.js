import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, resetAll, setAdjustment, addFilter, removeFilter,
  applyRecipeToState, stateToRecipeData,
} from '../js/core/state.js';
import { DEFAULT_ADJUSTMENTS } from '../js/core/pixel.js';

test('createState starts neutral with a full-frame crop', () => {
  const s = createState(800, 600);
  assert.deepEqual(s.adjustments, DEFAULT_ADJUSTMENTS);
  assert.deepEqual(s.filters, []);
  assert.deepEqual(s.crop, { x: 0, y: 0, width: 800, height: 600 });
  assert.equal(s.imageWidth, 800);
});

test('setAdjustment changes one slider and nothing else', () => {
  const s = setAdjustment(createState(10, 10), 'brightness', 42);
  assert.equal(s.adjustments.brightness, 42);
  assert.equal(s.adjustments.contrast, 0);
});

test('setAdjustment rejects unknown keys', () => {
  assert.throws(() => setAdjustment(createState(10, 10), 'clarity', 5), /Unknown adjustment/);
});

test('addFilter appends, removeFilter drops by index', () => {
  let s = createState(10, 10);
  s = addFilter(s, 'sepia');
  s = addFilter(s, 'vignette', 40);
  assert.equal(s.filters.length, 2);
  s = removeFilter(s, 0);
  assert.deepEqual(s.filters, [{ id: 'vignette', strength: 40 }]);
});

test('applyRecipeToState installs the recipe adjustments and filters', () => {
  const s = createState(10, 10);
  const recipe = { name: 'Test', adjustments: { ...DEFAULT_ADJUSTMENTS, warmth: 25 }, filters: [{ id: 'warm' }] };
  const next = applyRecipeToState(s, recipe);
  assert.equal(next.adjustments.warmth, 25);
  assert.deepEqual(next.filters, [{ id: 'warm' }]);
  assert.equal(next.imageWidth, 10); // image/crop are untouched by a recipe
});

test('stateToRecipeData extracts the editable parts of a state', () => {
  const s = addFilter(setAdjustment(createState(10, 10), 'contrast', 15), 'noir');
  const data = stateToRecipeData(s);
  assert.equal(data.adjustments.contrast, 15);
  assert.deepEqual(data.filters, [{ id: 'noir' }]);
  assert.equal('imageWidth' in data, false);
});

test('resetAll returns to neutral while keeping the image size', () => {
  let s = createState(800, 600);
  s = setAdjustment(s, 'brightness', 50);
  s = addFilter(s, 'sepia');
  const reset = resetAll(s);
  assert.deepEqual(reset.adjustments, DEFAULT_ADJUSTMENTS);
  assert.deepEqual(reset.filters, []);
  assert.equal(reset.imageWidth, 800);
});
