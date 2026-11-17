import test from 'node:test';
import assert from 'node:assert/strict';
import { computeHistogram, histogramStats, normalizeBins } from '../js/core/histogram.js';
import { makeBuffer } from '../js/core/utils.js';

test('histogram counts every pixel exactly once per channel', () => {
  const buf = makeBuffer(2, 2, [10, 20, 30, 255]);
  const hist = computeHistogram(buf);
  assert.equal(hist.total, 4);
  assert.equal(hist.red[10], 4);
  assert.equal(hist.green[20], 4);
  assert.equal(hist.blue[30], 4);
  assert.equal(hist.red.reduce((a, b) => a + b, 0), 4);
});

test('luminance bin matches the Rec. 601 luma of the pixel', () => {
  const buf = makeBuffer(1, 1, [255, 255, 255, 255]);
  const hist = computeHistogram(buf);
  assert.equal(hist.luminance[255], 1);
});

test('stats report mean brightness and clipping', () => {
  const buf = makeBuffer(2, 1, [0, 0, 0, 255]);
  buf.data[4] = 255; buf.data[5] = 255; buf.data[6] = 255;
  const stats = histogramStats(computeHistogram(buf));
  assert.equal(stats.mean, 127.5);
  assert.equal(stats.clippedBlack, 0.5);
  assert.equal(stats.clippedWhite, 0.5);
});

test('normalizeBins scales the peak to 1', () => {
  const norm = normalizeBins([0, 5, 10, 0]);
  assert.deepEqual(norm, [0, 0.5, 1, 0]);
});
