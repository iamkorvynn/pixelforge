// Sepia — warm brown tone, computed from luminance with the classic matrix.
import { clampByte } from '../core/utils.js';
import { luminance } from '../core/color.js';

export const id = 'sepia';
export const label = 'Sepia';
export const description = 'Warm brown antique tone.';

export function sepiaPixel(r, g, b) {
  const l = luminance(r, g, b);
  return [
    clampByte(l * 1.07),
    clampByte(l * 0.82),
    clampByte(l * 0.54),
  ];
}

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const [r, g, b] = sepiaPixel(buf.data[i], buf.data[i + 1], buf.data[i + 2]);
    out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
