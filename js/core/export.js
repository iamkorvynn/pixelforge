// Export — render the final image to a data URL at the chosen format and
// quality, plus a suggested filename. The canvas work itself lives in the
// editor; this module owns the format/quality rules and validation.
export const EXPORT_FORMATS = {
  png: { label: 'PNG (lossless)', mime: 'image/png', extension: 'png' },
  jpeg: { label: 'JPEG', mime: 'image/jpeg', extension: 'jpg' },
  webp: { label: 'WebP', mime: 'image/webp', extension: 'webp' },
};

export function validateExportOptions({ format = 'png', quality = 0.92 } = {}) {
  if (!EXPORT_FORMATS[format]) throw new Error(`Unsupported export format: ${format}`);
  const q = Number(quality);
  if (!Number.isFinite(q) || q < 0.1 || q > 1) throw new Error('Export quality must be between 0.1 and 1.');
  return { format, quality: q };
}

// Quality is ignored for PNG (lossless) — canvas.toDataURL handles that.
export function exportMime(format) {
  return EXPORT_FORMATS[format].mime;
}

export function exportFilename(baseName, format) {
  const clean = String(baseName || 'pixelforge-edit')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'pixelforge-edit';
  return `${clean}.${EXPORT_FORMATS[format].extension}`;
}
