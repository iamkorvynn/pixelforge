// Persistence — save the current edit (state + a JPEG data URL of the image)
// to storage so the session can be restored on reload. The image is stored
// as a JPEG data URL; images that would exceed ~3.5 MB are not persisted,
// so localStorage never overflows. `storage` is injected (localStorage in
// the app, a fake in tests) so this module stays DOM-free and testable.
export const EDIT_KEY = 'pixelforge.edit.v1';
const MAX_BYTES = 3_500_000;

export function saveEdit(storage, state, imageDataUrl, imageName) {
  if (!imageDataUrl || imageDataUrl.length > MAX_BYTES) return false;
  try {
    storage.setItem(EDIT_KEY, JSON.stringify({
      state, imageDataUrl, imageName: imageName || 'pixelforge-edit', savedAt: new Date().toISOString(),
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadEdit(storage) {
  let raw;
  try {
    raw = storage.getItem(EDIT_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.state || !parsed.imageDataUrl || typeof parsed.imageDataUrl !== 'string') return null;
    if (!parsed.imageDataUrl.startsWith('data:image/')) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEdit(storage) {
  try { storage.removeItem(EDIT_KEY); } catch { /* ignore */ }
}
