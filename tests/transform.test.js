import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rotate90Clockwise, flipHorizontal, flipVertical, applyTransform,
  rotateTransform, isIdentityTransform, DEFAULT_TRANSFORM,
} from '../js/core/transform.js';
import { makeBuffer, setPixel, getPixel } from '../js/core/utils.js';

// 2x1 buffer: [red, green]
const twoByOne = () => {
  const buf = makeBuffer(2, 1, [0, 0, 0, 255]);
  setPixel(buf, 0, 0, [255, 0, 0, 255]);
  setPixel(buf, 1, 0, [0, 255, 0, 255]);
  return buf;
};

test('rotate90Clockwise swaps dimensions and moves pixels', () => {
  const out = rotate90Clockwise(twoByOne());
  assert.equal(out.width, 1);
  assert.equal(out.height, 2);
  assert.deepEqual(getPixel(out, 0, 0), [255, 0, 0, 255]); // red on top
  assert.deepEqual(getPixel(out, 0, 1), [0, 255, 0, 255]); // green below
});

test('four 90-degree rotations return the original', () => {
  let buf = twoByOne();
  const original = [...buf.data];
  for (let i = 0; i < 4; i++) buf = rotate90Clockwise(buf);
  assert.equal(buf.width, 2);
  assert.deepEqual([...buf.data], original);
});

test('flipping twice returns the original', () => {
  const buf = twoByOne();
  assert.deepEqual([...flipHorizontal(flipHorizontal(buf)).data], [...buf.data]);
  assert.deepEqual([...flipVertical(flipVertical(buf)).data], [...buf.data]);
});

test('flipHorizontal swaps left and right', () => {
  const out = flipHorizontal(twoByOne());
  assert.deepEqual(getPixel(out, 0, 0), [0, 255, 0, 255]);
  assert.deepEqual(getPixel(out, 1, 0), [255, 0, 0, 255]);
});

test('applyTransform with a 180 rotation swaps both axes', () => {
  const out = applyTransform(twoByOne(), { rotate: 180, flipH: false, flipV: false });
  assert.deepEqual(getPixel(out, 0, 0), [0, 255, 0, 255]);
});

test('applyTransform with the identity transform changes nothing', () => {
  const buf = twoByOne();
  const out = applyTransform(buf, DEFAULT_TRANSFORM);
  assert.deepEqual([...out.data], [...buf.data]);
});

test('rotateTransform cycles 0 -> 90 -> 180 -> 270 -> 0', () => {
  let t = DEFAULT_TRANSFORM;
  for (const expected of [90, 180, 270, 0]) {
    t = rotateTransform(t);
    assert.equal(t.rotate, expected);
  }
});

test('isIdentityTransform detects the neutral transform', () => {
  assert.equal(isIdentityTransform(DEFAULT_TRANSFORM), true);
  assert.equal(isIdentityTransform({ ...DEFAULT_TRANSFORM, flipH: true }), false);
  assert.equal(isIdentityTransform({ ...DEFAULT_TRANSFORM, rotate: 90 }), false);
});
