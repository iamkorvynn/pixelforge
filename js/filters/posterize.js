// Posterize — reduce the colour depth to `levels` steps per channel.
import { clampByte } from '../core/utils.js';

export const id = 'posterize';
export const label = 'Posterize';
export const description = 'Flat graphic look with few colour steps.';

export function apply(buf, levels = 4) {
  const step = 255 / (levels - 1);
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    out[i] = clampByte(Math.round(buf.data[i] / step) * step);
    out[i + 1] = clampByte(Math.round(buf.data[i + 1] / step) * step);
    out[i + 2] = clampByte(Math.round(buf.data[i + 2] / step) * step);
    out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
