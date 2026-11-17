import test from 'node:test';
import assert from 'node:assert/strict';
import { convolve, blur, sharpen, GAUSSIAN_BLUR_3, SHARPEN_3, EDGE_3 } from '../js/core/convolution.js';
import { makeBuffer, setPixel, getPixel } from '../js/core/utils.js';

test('convolving a uniform image leaves it unchanged (blur and sharpen)', () => {
  const buf = makeBuffer(5, 5, [100, 150, 200, 255]);
  const blurred = convolve(buf, GAUSSIAN_BLUR_3, 16);
  const sharp = convolve(buf, SHARPEN_3, 1);
  assert.deepEqual([...blurred.data], [...buf.data]);
  assert.deepEqual([...sharp.data], [...buf.data]);
});

test('edge kernel on a uniform image gives zero (no edges)', () => {
  const buf = makeBuffer(4, 4, [90, 90, 90, 255]);
  const out = convolve(buf, EDGE_3, 1);
  assert.deepEqual(getPixel(out, 1, 1).slice(0, 3), [0, 0, 0]);
});

test('blur spreads a single bright pixel to its neighbours', () => {
  const buf = makeBuffer(5, 5, [0, 0, 0, 255]);
  setPixel(buf, 2, 2, [255, 255, 255, 255]);
  const out = blur(buf, 1);
  const centre = getPixel(out, 2, 2)[0];
  const neighbour = getPixel(out, 2, 3)[0];
  const far = getPixel(out, 0, 0)[0];
  assert.ok(centre < 255 && centre > 0, 'centre should be dimmed');
  assert.ok(neighbour > 0, 'neighbour should pick up light');
  assert.equal(far, 0, 'far corner untouched by a 3x3 blur');
});

test('sharpen raises the centre of a bright dot and darkens its ring', () => {
  const buf = makeBuffer(5, 5, [100, 100, 100, 255]);
  setPixel(buf, 2, 2, [200, 200, 200, 255]);
  const out = sharpen(buf, 1);
  assert.ok(getPixel(out, 2, 2)[0] > 200, 'centre sharpened above 200');
  assert.ok(getPixel(out, 2, 3)[0] < 100, 'neighbour pushed below the flat value');
});

test('convolve rejects a non-square kernel', () => {
  const buf = makeBuffer(3, 3);
  assert.throws(() => convolve(buf, [1, 2, 3]), /square/);
});

test('convolve preserves alpha', () => {
  const buf = makeBuffer(3, 3, [50, 60, 70, 123]);
  const out = convolve(buf, GAUSSIAN_BLUR_3, 16);
  assert.equal(getPixel(out, 1, 1)[3], 123);
});
