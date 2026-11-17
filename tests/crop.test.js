import test from 'node:test';
import assert from 'node:assert/strict';
import { fullCrop, clampCrop, centredCrop, cropBuffer, dragCrop } from '../js/core/crop.js';
import { makeBuffer, setPixel, getPixel } from '../js/core/utils.js';

test('fullCrop covers the whole image', () => {
  assert.deepEqual(fullCrop(100, 60), { x: 0, y: 0, width: 100, height: 60 });
});

test('centredCrop keeps the requested aspect ratio', () => {
  const c = centredCrop(100, 60, 1);
  assert.equal(c.width, c.height);
  assert.equal(c.width, 60);
  assert.equal(c.x, 20);
  const wide = centredCrop(100, 100, 16 / 9);
  assert.ok(Math.abs(wide.width / wide.height - 16 / 9) < 0.05);
});

test('centredCrop with no ratio returns the full frame', () => {
  assert.deepEqual(centredCrop(80, 40, null), fullCrop(80, 40));
});

test('clampCrop keeps the rect inside the image', () => {
  const c = clampCrop({ x: -10, y: 90, width: 200, height: 200 }, 100, 100);
  assert.equal(c.x, 0);
  assert.equal(c.y, 0);
  assert.equal(c.width, 100);
  assert.equal(c.height, 100);
});

test('cropBuffer extracts the right pixels', () => {
  const buf = makeBuffer(4, 4, [0, 0, 0, 255]);
  setPixel(buf, 2, 1, [255, 0, 0, 255]);
  const out = cropBuffer(buf, { x: 1, y: 1, width: 2, height: 2 });
  assert.equal(out.width, 2);
  assert.equal(out.height, 2);
  assert.deepEqual(getPixel(out, 1, 0), [255, 0, 0, 255]);
  assert.deepEqual(getPixel(out, 0, 0), [0, 0, 0, 255]);
});

test('dragCrop moves the rect with the move handle', () => {
  const r = dragCrop({ x: 10, y: 10, width: 40, height: 40 }, 'move', 5, -5, 100, 100);
  assert.deepEqual(r, { x: 15, y: 5, width: 40, height: 40 });
});

test('dragCrop grows the rect with the se handle', () => {
  const r = dragCrop({ x: 10, y: 10, width: 40, height: 40 }, 'se', 10, 10, 100, 100);
  assert.deepEqual(r, { x: 10, y: 10, width: 50, height: 50 });
});

test('dragCrop with a ratio keeps width/height proportional', () => {
  const r = dragCrop({ x: 0, y: 0, width: 40, height: 40 }, 'e', 20, 0, 100, 100, 1);
  assert.equal(r.width, 60);
  assert.equal(r.height, 60);
});

test('dragCrop cannot drag the rect outside the image', () => {
  const r = dragCrop({ x: 80, y: 80, width: 20, height: 20 }, 'move', 50, 50, 100, 100);
  assert.equal(r.x, 80);
  assert.equal(r.y, 80);
});
