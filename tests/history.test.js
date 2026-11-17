import test from 'node:test';
import assert from 'node:assert/strict';
import { History } from '../js/core/history.js';

const s = (n) => ({ adjustments: { brightness: n }, filters: [], transform: { rotate: 0, flipH: false, flipV: false }, crop: { x: 0, y: 0, width: 10, height: 10 }, imageWidth: 10, imageHeight: 10 });

test('cannot undo with a single state, can after a second push', () => {
  const h = new History();
  h.push(s(0));
  assert.equal(h.canUndo(), false);
  h.push(s(10));
  assert.equal(h.canUndo(), true);
});

test('undo returns the previous state and redo brings it back', () => {
  const h = new History();
  h.push(s(0));
  h.push(s(10));
  h.push(s(20));
  const undone = h.undo(s(20));
  assert.equal(undone.adjustments.brightness, 10);
  assert.equal(h.canRedo(), true);
  const redone = h.redo(undone);
  assert.equal(redone.adjustments.brightness, 20);
  assert.equal(h.canRedo(), false);
});

test('pushing a new state clears the redo stack', () => {
  const h = new History();
  h.push(s(0));
  h.push(s(10));
  h.undo(s(10));
  assert.equal(h.canRedo(), true);
  h.push(s(99));
  assert.equal(h.canRedo(), false);
});

test('undo returns null when there is nothing to undo', () => {
  const h = new History();
  h.push(s(0));
  assert.equal(h.undo(s(0)), null);
  assert.equal(h.redo(s(0)), null);
});

test('history respects its size limit', () => {
  const h = new History(3);
  h.push(s(0)); h.push(s(1)); h.push(s(2)); h.push(s(3)); h.push(s(4));
  assert.equal(h.undoCount, 2); // only 3 states kept: 2,3,4
  assert.equal(h.current().adjustments.brightness, 4);
});

test('states are snapshots: later mutation does not rewrite history', () => {
  const h = new History();
  const first = s(0);
  h.push(first);
  first.adjustments.brightness = 999;
  assert.equal(h.current().adjustments.brightness, 0);
});

test('clear empties both stacks', () => {
  const h = new History();
  h.push(s(0)); h.push(s(1));
  h.clear();
  assert.equal(h.canUndo(), false);
  assert.equal(h.canRedo(), false);
});
