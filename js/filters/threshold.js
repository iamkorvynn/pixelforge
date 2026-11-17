// Threshold — pure black & white at a luminance cutoff.
import { luminance } from '../core/color.js';

export const id = 'threshold';
export const label = 'Threshold';
export const description = 'Hard black & white at a brightness cutoff.';

export function apply(buf, threshold = 128) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const v = luminance(buf.data[i], buf.data[i + 1], buf.data[i + 2]) >= threshold ? 255 : 0;
    out[i] = v; out[i + 1] = v; out[i + 2] = v; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
