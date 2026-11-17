import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, clamp01, clampByte, lerp, sliderToFactor, makeBuffer, getPixel, setPixel, cloneBuffer } from '../js/core/utils.js';

test('clamp keeps values inside the range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
  assert.equal(clamp(200), 200); // default range is 0..255
  assert.equal(clamp(300), 255);
});

test('clamp01 pins to 0..1', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.5), 1);
  assert.equal(clamp01(0.42), 0.42);
});

test('clampByte rounds and pins to a byte', () => {
  assert.equal(clampByte(127.6), 128);
  assert.equal(clampByte(-10), 0);
  assert.equal(clampByte(300), 255);
});

test('lerp interpolates', () => {
  assert.equal(lerp(0, 100, 0.25), 25);
  assert.equal(lerp(10, 20, 1), 20);
});

test('sliderToFactor maps -100..100 to 0..1', () => {
  assert.equal(sliderToFactor(-100), 0);
  assert.equal(sliderToFactor(0), 1);
  assert.equal(sliderToFactor(100), 1); // clamped at 1
});

test('makeBuffer fills with the given colour and get/set round-trip', () => {
  const buf = makeBuffer(3, 2, [9, 8, 7, 6]);
  assert.equal(buf.width, 3);
  assert.equal(buf.height, 2);
  assert.deepEqual(getPixel(buf, 0, 0), [9, 8, 7, 6]);
  setPixel(buf, 2, 1, [1, 2, 3, 4]);
  assert.deepEqual(getPixel(buf, 2, 1), [1, 2, 3, 4]);
  assert.deepEqual(getPixel(buf, 0, 0), [9, 8, 7, 6]); // other pixels untouched
});

test('cloneBuffer is a deep copy', () => {
  const buf = makeBuffer(2, 2, [1, 2, 3, 255]);
  const copy = cloneBuffer(buf);
  setPixel(copy, 0, 0, [9, 9, 9, 255]);
  assert.deepEqual(getPixel(buf, 0, 0), [1, 2, 3, 255]);
});
