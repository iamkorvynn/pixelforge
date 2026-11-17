// Clarity — local contrast via an unsharp-mask blend: mix the original with
// its sharpened version. Strength 0..100 controls the blend.
import { sharpen } from '../core/convolution.js';
import { clampByte, lerp } from '../core/utils.js';

export const id = 'clarity';
export const label = 'Clarity';
export const description = 'Local contrast: extra bite without harsh edges.';

export function apply(buf, strength = 50) {
  const sharp = sharpen(buf, 1);
  const t = Math.max(0, Math.min(100, strength)) / 100;
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    out[i] = clampByte(lerp(buf.data[i], sharp.data[i], t));
    out[i + 1] = clampByte(lerp(buf.data[i + 1], sharp.data[i + 1], t));
    out[i + 2] = clampByte(lerp(buf.data[i + 2], sharp.data[i + 2], t));
    out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
