import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustBrightness, adjustContrast, adjustSaturation, adjustExposure,
  adjustHighlights, adjustShadows, adjustVibrance, applyAdjustmentsToPixel,
  applyAdjustments, isNeutral, DEFAULT_ADJUSTMENTS,
} from '../js/core/pixel.js';

const buf = (pixels, w = 2, h = 1) => ({
  width: w, height: h,
  data: new Uint8ClampedArray(pixels.flatMap(([r, g, b, a = 255]) => [r, g, b, a])),
});

test('brightness +100 lifts every channel, -100 darkens', () => {
  assert.deepEqual(adjustBrightness(100, 100, 100, 100).map(Math.round), [227, 227, 227]);
  assert.deepEqual(adjustBrightness(100, 100, 100, -100).map(Math.round), [-27, -27, -27]);
  assert.deepEqual(adjustBrightness(10, 20, 30, 0), [10, 20, 30]);
});

test('contrast 0 is a no-op and +100 increases spread', () => {
  assert.deepEqual(adjustContrast(200, 50, 128, 0).map(Math.round), [200, 50, 128]);
  const [hi, lo] = adjustContrast(200, 50, 128, 100);
  assert.ok(hi > 200 && lo < 50, 'contrast should push extremes apart');
});

test('saturation -100 produces grey (all channels equal to luma)', () => {
  const [r, g, b] = adjustSaturation(200, 100, 50, -100);
  assert.ok(Math.abs(r - g) < 1 && Math.abs(g - b) < 1);
  assert.ok(Math.abs(r - 124) < 2); // 0.299*200 + 0.587*100 + 0.114*50 ≈ 124
});

test('exposure +100 doubles channels, -100 halves them', () => {
  assert.deepEqual(adjustExposure(100, 50, 25, 100).map(Math.round), [200, 100, 50]);
  assert.deepEqual(adjustExposure(100, 50, 25, -100).map(Math.round), [50, 25, 13]);
});

test('highlights only lift bright pixels, shadows only lift dark pixels', () => {
  const [r1] = adjustHighlights(250, 250, 250, 50);
  const [r2] = adjustHighlights(20, 20, 20, 50);
  assert.ok(r1 > 250 && r2 === 20, 'highlights must not touch dark pixels');
  const [s1] = adjustShadows(20, 20, 20, 50);
  const [s2] = adjustShadows(250, 250, 250, 50);
  assert.ok(s1 > 20 && s2 === 250, 'shadows must not touch bright pixels');
});

test('vibrance protects already-saturated pixels', () => {
  const grey = adjustVibrance(128, 128, 128, 100);
  const vivid = adjustVibrance(255, 0, 0, 100);
  assert.deepEqual(grey.map(Math.round), [128, 128, 128]); // grey has no saturation to add
  assert.deepEqual(vivid.map(Math.round), [255, 0, 0]); // fully saturated stays put
});

test('applyAdjustmentsToPixel clamps into 0..255', () => {
  const [r, g, b] = applyAdjustmentsToPixel(250, 250, 250, { ...DEFAULT_ADJUSTMENTS, exposure: 100 });
  assert.deepEqual([r, g, b], [255, 255, 255]);
});

test('applyAdjustments leaves the buffer untouched when neutral', () => {
  const b = buf([[10, 20, 30], [200, 150, 100]]);
  const out = applyAdjustments(b, DEFAULT_ADJUSTMENTS);
  assert.deepEqual([...out.data], [...b.data]);
});

test('applyAdjustments preserves alpha', () => {
  const b = buf([[10, 20, 30, 77]]);
  const out = applyAdjustments(b, { ...DEFAULT_ADJUSTMENTS, brightness: 50 });
  assert.equal(out.data[3], 77);
});

test('isNeutral is true only for the default adjustments', () => {
  assert.equal(isNeutral(DEFAULT_ADJUSTMENTS), true);
  assert.equal(isNeutral({ ...DEFAULT_ADJUSTMENTS, brightness: 1 }), false);
});
