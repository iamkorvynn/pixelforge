import test from 'node:test';
import assert from 'node:assert/strict';
import { saveEdit, loadEdit, clearEdit, EDIT_KEY } from '../js/core/persistence.js';
import { createState } from '../js/core/state.js';

const fakeStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
};

test('save then load round-trips state and image', () => {
  const storage = fakeStorage();
  const state = createState(100, 50);
  state.adjustments.brightness = 20;
  assert.equal(saveEdit(storage, state, 'data:image/jpeg;base64,AAAA', 'my-photo'), true);
  const back = loadEdit(storage);
  assert.equal(back.imageName, 'my-photo');
  assert.equal(back.state.adjustments.brightness, 20);
  assert.equal(back.state.imageWidth, 100);
});

test('load returns null when nothing was saved', () => {
  assert.equal(loadEdit(fakeStorage()), null);
});

test('load returns null for corrupted or wrong-shaped data', () => {
  const storage = fakeStorage();
  storage.setItem(EDIT_KEY, 'not json');
  assert.equal(loadEdit(storage), null);
  storage.setItem(EDIT_KEY, JSON.stringify({ state: {} }));
  assert.equal(loadEdit(storage), null);
  storage.setItem(EDIT_KEY, JSON.stringify({ state: {}, imageDataUrl: 'https://evil.example/x.png' }));
  assert.equal(loadEdit(storage), null);
});

test('oversized images are not persisted', () => {
  const storage = fakeStorage();
  assert.equal(saveEdit(storage, createState(10, 10), `data:image/jpeg;base64,${'A'.repeat(4_000_000)}`, 'big'), false);
  assert.equal(loadEdit(storage), null);
});

test('clear removes the saved edit', () => {
  const storage = fakeStorage();
  saveEdit(storage, createState(10, 10), 'data:image/png;base64,AAAA', 'x');
  clearEdit(storage);
  assert.equal(loadEdit(storage), null);
});
