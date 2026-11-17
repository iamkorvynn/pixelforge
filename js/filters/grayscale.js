// Grayscale — replace each pixel with its Rec. 601 luminance.
import { clampByte } from '../core/utils.js';
import { luminance } from '../core/color.js';

export const id = 'grayscale';
export const label = 'Grayscale';
export const description = 'Removes all colour, keeping only brightness.';

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const l = clampByte(luminance(buf.data[i], buf.data[i + 1], buf.data[i + 2]));
    out[i] = l; out[i + 1] = l; out[i + 2] = l; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
