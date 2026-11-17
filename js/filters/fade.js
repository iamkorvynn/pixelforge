// Fade — washed-out matte look: raise blacks, compress whites, slight cool tint.
import { clampByte } from '../core/utils.js';

export const id = 'fade';
export const label = 'Fade';
export const description = 'Matte, washed-out film fade.';

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    out[i] = clampByte(buf.data[i] * 0.85 + 28);
    out[i + 1] = clampByte(buf.data[i + 1] * 0.85 + 30);
    out[i + 2] = clampByte(buf.data[i + 2] * 0.85 + 36);
    out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
