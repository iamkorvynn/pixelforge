// Noir — high-contrast black & white with crushed blacks.
import { clampByte } from '../core/utils.js';
import { luminance } from '../core/color.js';

export const id = 'noir';
export const label = 'Noir';
export const description = 'Hard black & white with deep shadows.';

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const l = luminance(buf.data[i], buf.data[i + 1], buf.data[i + 2]);
    // S-curve: push darks darker, lights lighter.
    const v = clampByte(255 / (1 + Math.exp(-(l - 128) / 28)));
    out[i] = v; out[i + 1] = v; out[i + 2] = v; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
