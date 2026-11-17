// Vintage — faded film look: lifted blacks, warm highlights, reduced contrast.
import { clampByte } from '../core/utils.js';

export const id = 'vintage';
export const label = 'Vintage';
export const description = 'Faded film: lifted blacks and warm, soft highlights.';

export function vintagePixel(r, g, b) {
  // Lift the blacks (fade), then warm the result slightly.
  const fade = (v) => v * 0.82 + 32;
  return [
    clampByte(fade(r) * 1.06),
    clampByte(fade(g) * 1.0),
    clampByte(fade(b) * 0.92),
  ];
}

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const [r, g, b] = vintagePixel(buf.data[i], buf.data[i + 1], buf.data[i + 2]);
    out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
