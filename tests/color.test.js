import test from 'node:test';
import assert from 'node:assert/strict';
import { luminance, rgbToHsl, hslToRgb, shiftHue, applyWarmth } from '../js/core/color.js';

test('luminance of pure white is 255, black is 0', () => {
  assert.equal(Math.round(luminance(255, 255, 255)), 255);
  assert.equal(luminance(0, 0, 0), 0);
});

test('luminance weights green most', () => {
  assert.ok(luminance(0, 255, 0) > luminance(255, 0, 0));
  assert.ok(luminance(255, 0, 0) > luminance(0, 0, 255));
});

test('rgbToHsl/hslToRgb round-trip for several colours', () => {
  for (const [r, g, b] of [[255, 0, 0], [0, 255, 0], [0, 0, 255], [128, 64, 200], [12, 34, 56], [255, 255, 255], [0, 0, 0]]) {
    const [h, s, l] = rgbToHsl(r, g, b);
    const [r2, g2, b2] = hslToRgb(h, s, l);
    assert.ok(Math.abs(r - r2) <= 1 && Math.abs(g - g2) <= 1 && Math.abs(b - b2) <= 1, `round-trip failed for ${r},${g},${b}`);
  }
});

test('rgbToHsl of grey has zero saturation', () => {
  const [h, s, l] = rgbToHsl(128, 128, 128);
  assert.equal(s, 0);
  assert.ok(Math.abs(l - 0.502) < 0.01);
});

test('shiftHue by 120 turns red into green', () => {
  const [r, g, b] = shiftHue(255, 0, 0, 120);
  assert.ok(g > 200 && r < 50 && b < 50, `got ${r},${g},${b}`);
});

test('shiftHue by 360 is a no-op', () => {
  assert.deepEqual(shiftHue(200, 100, 50, 360), shiftHue(200, 100, 50, 0));
});

test('applyWarmth pushes red up and blue down for positive amounts', () => {
  const [r, g, b] = applyWarmth(128, 128, 128, 100);
  assert.ok(r > 128 && b < 128);
  const [r2, , b2] = applyWarmth(128, 128, 128, -100);
  assert.ok(r2 < 128 && b2 > 128);
});
