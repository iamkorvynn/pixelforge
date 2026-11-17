import test from 'node:test';
import assert from 'node:assert/strict';
import { apply as grayscale } from '../js/filters/grayscale.js';
import { apply as sepia, sepiaPixel } from '../js/filters/sepia.js';
import { apply as invert, invertPixel } from '../js/filters/invert.js';
import { apply as vignette } from '../js/filters/vignette.js';
import { apply as posterize } from '../js/filters/posterize.js';
import { apply as noir } from '../js/filters/noir.js';
import { apply as duotone } from '../js/filters/duotone.js';
import { apply as vintage } from '../js/filters/vintage.js';
import { makeBuffer, getPixel } from '../js/core/utils.js';

test('grayscale makes every channel equal to luminance', () => {
  const buf = makeBuffer(1, 1, [200, 100, 50, 255]);
  const out = grayscale(buf);
  const [r, g, b] = getPixel(out, 0, 0);
  assert.equal(r, g);
  assert.equal(g, b);
  assert.ok(Math.abs(r - 124) <= 1);
});

test('sepia of a mid-grey is warm (red > green > blue)', () => {
  const [r, g, b] = sepiaPixel(128, 128, 128);
  assert.ok(r > g && g > b, `sepia grey should be warm, got ${r},${g},${b}`);
});

test('sepia preserves relative brightness order', () => {
  const dark = sepiaPixel(50, 50, 50);
  const light = sepiaPixel(200, 200, 200);
  assert.ok(light[0] > dark[0]);
});

test('invert twice returns the original pixel', () => {
  for (const [r, g, b] of [[0, 0, 0], [255, 255, 255], [12, 200, 90]]) {
    const [r2, g2, b2] = invertPixel(...invertPixel(r, g, b));
    assert.deepEqual([r2, g2, b2], [r, g, b]);
  }
});

test('invert of a buffer flips every channel', () => {
  const buf = makeBuffer(1, 1, [10, 20, 30, 255]);
  const out = invert(buf);
  assert.deepEqual(getPixel(out, 0, 0), [245, 235, 225, 255]);
});

test('vignette leaves the centre untouched and darkens corners', () => {
  const buf = makeBuffer(9, 9, [200, 200, 200, 255]);
  const out = vignette(buf, 80);
  assert.equal(getPixel(out, 4, 4)[0], 200);
  assert.ok(getPixel(out, 0, 0)[0] < 200);
  assert.ok(getPixel(out, 8, 8)[0] < 200);
});

test('vignette at strength 0 changes nothing', () => {
  const buf = makeBuffer(5, 5, [123, 45, 67, 255]);
  assert.deepEqual([...vignette(buf, 0).data], [...buf.data]);
});

test('posterize with 2 levels only outputs 0 or 255', () => {
  const buf = makeBuffer(1, 1, [100, 180, 30, 255]);
  const out = posterize(buf, 2);
  const [r, g, b] = getPixel(out, 0, 0);
  assert.ok([0, 255].includes(r) && [0, 255].includes(g) && [0, 255].includes(b));
});

test('noir output is always grey', () => {
  const buf = makeBuffer(2, 1, [255, 0, 0, 255]);
  buf.data[4] = 0; buf.data[5] = 255; buf.data[6] = 0;
  const out = noir(buf);
  for (const [r, g, b] of [getPixel(out, 0, 0), getPixel(out, 1, 0)]) assert.equal(r, g);
});

test('duotone maps black to the dark colour and white to the light colour', () => {
  const black = makeBuffer(1, 1, [0, 0, 0, 255]);
  const white = makeBuffer(1, 1, [255, 255, 255, 255]);
  assert.deepEqual(getPixel(duotone(black), 0, 0), [18, 28, 64, 255]);
  assert.deepEqual(getPixel(duotone(white), 0, 0), [255, 226, 178, 255]);
});

test('vintage lifts pure black above zero (faded blacks)', () => {
  const buf = makeBuffer(1, 1, [0, 0, 0, 255]);
  const [r] = getPixel(vintage(buf), 0, 0);
  assert.ok(r > 0);
});
