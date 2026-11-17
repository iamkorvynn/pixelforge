import test from 'node:test';
import assert from 'node:assert/strict';
import { validateExportOptions, exportMime, exportFilename, EXPORT_FORMATS } from '../js/core/export.js';

test('all three formats are known', () => {
  assert.deepEqual(Object.keys(EXPORT_FORMATS).sort(), ['jpeg', 'png', 'webp']);
});

test('validateExportOptions accepts valid options', () => {
  assert.deepEqual(validateExportOptions({ format: 'jpeg', quality: 0.8 }), { format: 'jpeg', quality: 0.8 });
  assert.deepEqual(validateExportOptions({}), { format: 'png', quality: 0.92 });
});

test('validateExportOptions rejects unknown formats and bad quality', () => {
  assert.throws(() => validateExportOptions({ format: 'tiff' }), /Unsupported export format/);
  assert.throws(() => validateExportOptions({ format: 'png', quality: 0 }), /quality/);
  assert.throws(() => validateExportOptions({ format: 'png', quality: 1.5 }), /quality/);
});

test('exportMime returns the right MIME type', () => {
  assert.equal(exportMime('png'), 'image/png');
  assert.equal(exportMime('jpeg'), 'image/jpeg');
  assert.equal(exportMime('webp'), 'image/webp');
});

test('exportFilename swaps the extension and sanitises the name', () => {
  assert.equal(exportFilename('my photo.png', 'jpeg'), 'my-photo.jpg');
  assert.equal(exportFilename('Sunset @ Beach!', 'png'), 'Sunset-Beach.png');
  assert.equal(exportFilename('', 'webp'), 'pixelforge-edit.webp');
  assert.equal(exportFilename('already.webp', 'webp'), 'already.webp');
});
