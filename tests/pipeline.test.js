import test from 'node:test';
import assert from 'node:assert/strict';
import { runPipeline, describePipeline } from '../js/core/pipeline.js';
import { DEFAULT_ADJUSTMENTS } from '../js/core/pixel.js';
import { makeBuffer, getPixel } from '../js/core/utils.js';

test('describePipeline says Original when nothing is set', () => {
  assert.equal(describePipeline(DEFAULT_ADJUSTMENTS, []), 'Original (no edits)');
});

test('describePipeline lists adjustments and filters in order', () => {
  const text = describePipeline({ ...DEFAULT_ADJUSTMENTS, brightness: 20 }, [{ id: 'sepia' }]);
  assert.ok(text.includes('brightness +20'));
  assert.ok(text.includes('Sepia'));
  assert.ok(text.indexOf('Adjust') < text.indexOf('Sepia'));
});

test('runPipeline with no edits returns the same pixels', () => {
  const buf = makeBuffer(2, 2, [10, 20, 30, 255]);
  const out = runPipeline(buf, DEFAULT_ADJUSTMENTS, []);
  assert.deepEqual([...out.data], [...buf.data]);
});

test('runPipeline applies adjustments then filters in order', () => {
  const buf = makeBuffer(1, 1, [100, 100, 100, 255]);
  // brightness +100 then invert: 100+127=227, inverted = 28
  const out = runPipeline(buf, { ...DEFAULT_ADJUSTMENTS, brightness: 100 }, [{ id: 'invert' }]);
  assert.deepEqual(getPixel(out, 0, 0).slice(0, 3), [28, 28, 28]);
});

test('runPipeline skips unknown filter ids instead of crashing', () => {
  const buf = makeBuffer(1, 1, [100, 100, 100, 255]);
  const out = runPipeline(buf, DEFAULT_ADJUSTMENTS, [{ id: 'does-not-exist' }, { id: 'invert' }]);
  assert.deepEqual(getPixel(out, 0, 0).slice(0, 3), [155, 155, 155]);
});

test('runPipeline does not mutate the input buffer', () => {
  const buf = makeBuffer(1, 1, [100, 100, 100, 255]);
  runPipeline(buf, { ...DEFAULT_ADJUSTMENTS, brightness: 50 }, [{ id: 'sepia' }]);
  assert.deepEqual(getPixel(buf, 0, 0), [100, 100, 100, 255]);
});
