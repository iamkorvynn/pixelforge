// Crop math — rectangles in image coordinates, aspect-ratio presets, and
// the draggable-handle geometry used by the crop overlay.
// A crop rect is { x, y, width, height } in image pixels.
import { clamp } from './utils.js';

export const ASPECT_PRESETS = {
  free: { label: 'Free', ratio: null },
  '1:1': { label: 'Square 1:1', ratio: 1 },
  '4:3': { label: '4:3', ratio: 4 / 3 },
  '3:2': { label: '3:2', ratio: 3 / 2 },
  '16:9': { label: '16:9', ratio: 16 / 9 },
  '9:16': { label: '9:16 (story)', ratio: 9 / 16 },
  '3:4': { label: '3:4', ratio: 3 / 4 },
};

export function fullCrop(imageWidth, imageHeight) {
  return { x: 0, y: 0, width: imageWidth, height: imageHeight };
}

// Clamp a crop rect so it stays inside the image and keeps a minimum size.
export function clampCrop(rect, imageWidth, imageHeight, minSize = 8) {
  const width = clamp(rect.width, minSize, imageWidth);
  const height = clamp(rect.height, minSize, imageHeight);
  const x = clamp(rect.x, 0, imageWidth - width);
  const y = clamp(rect.y, 0, imageHeight - height);
  return { x, y, width, height };
}

// Largest rect of the given ratio centred inside the image.
export function centredCrop(imageWidth, imageHeight, ratio) {
  if (!ratio) return fullCrop(imageWidth, imageHeight);
  let width = imageWidth, height = width / ratio;
  if (height > imageHeight) {
    height = imageHeight;
    width = height * ratio;
  }
  return {
    x: Math.round((imageWidth - width) / 2),
    y: Math.round((imageHeight - height) / 2),
    width: Math.round(width),
    height: Math.round(height),
  };
}

// Apply a crop rect to a pixel buffer, returning a new buffer.
export function cropBuffer(buf, rect) {
  const { x, y, width, height } = rect;
  const out = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row++) {
    const srcStart = ((y + row) * buf.width + x) * 4;
    const dstStart = row * width * 4;
    out.set(buf.data.subarray(srcStart, srcStart + width * 4), dstStart);
  }
  return { width, height, data: out };
}

// Resize a crop rect by dragging one corner/edge handle.
// handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'move'
// dx, dy are deltas in image pixels.
export function dragCrop(rect, handle, dx, dy, imageWidth, imageHeight, ratio = null) {
  let r = { ...rect };
  if (handle === 'move') {
    r.x += dx; r.y += dy;
  } else {
    if (handle.includes('e')) r.width += dx;
    if (handle.includes('w')) { r.x += dx; r.width -= dx; }
    if (handle.includes('s')) r.height += dy;
    if (handle.includes('n')) { r.y += dy; r.height -= dy; }
    if (ratio) {
      // Keep the ratio by deriving height from width (or vice versa for n/s).
      if (handle.includes('e') || handle.includes('w')) r.height = r.width / ratio;
      else r.width = r.height * ratio;
    }
  }
  return clampCrop(r, imageWidth, imageHeight);
}
