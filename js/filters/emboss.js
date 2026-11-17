// Emboss — relief effect from the emboss convolution kernel.
import { convolve, EMBOSS_3 } from '../core/convolution.js';
import { clampByte } from '../core/utils.js';

export const id = 'emboss';
export const label = 'Emboss';
export const description = 'Raised relief / embossed look.';

export function apply(buf) {
  const edges = convolve(buf, EMBOSS_3, 1, 128);
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const v = clampByte((edges.data[i] + edges.data[i + 1] + edges.data[i + 2]) / 3);
    out[i] = v; out[i + 1] = v; out[i + 2] = v; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
