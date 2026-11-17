// Cool — push the image toward blue/teal.
import { clampByte } from '../core/utils.js';

export const id = 'cool';
export const label = 'Cool';
export const description = 'Icy blue/teal cast.';

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    out[i] = clampByte(buf.data[i] * 0.9);
    out[i + 1] = clampByte(buf.data[i + 1] * 1.0);
    out[i + 2] = clampByte(buf.data[i + 2] * 1.12 + 6);
    out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
