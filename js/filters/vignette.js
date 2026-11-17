// Vignette — darken the corners, keeping the centre bright.
// Strength 0..100 controls how much of the frame falls off.
import { clampByte } from '../core/utils.js';

export const id = 'vignette';
export const label = 'Vignette';
export const description = 'Darkens the corners to draw the eye to the centre.';

export function apply(buf, strength = 50) {
  const { width, height, data } = buf;
  const out = new Uint8ClampedArray(data.length);
  const cx = width / 2, cy = height / 2;
  const maxDist = Math.hypot(cx, cy);
  const amount = strength / 100;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const d = Math.hypot(x - cx, y - cy) / maxDist; // 0 centre, ~1 corner
      const falloff = 1 - amount * Math.pow(d, 2.2) * 0.85;
      out[i] = clampByte(data[i] * falloff);
      out[i + 1] = clampByte(data[i + 1] * falloff);
      out[i + 2] = clampByte(data[i + 2] * falloff);
      out[i + 3] = data[i + 3];
    }
  }
  return { width, height, data: out };
}
