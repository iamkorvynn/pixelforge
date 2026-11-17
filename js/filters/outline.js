// Outline — edge detection via the Laplacian kernel, inverted to a sketch look.
import { convolve, EDGE_3 } from '../core/convolution.js';
import { clampByte } from '../core/utils.js';

export const id = 'outline';
export const label = 'Outline';
export const description = 'Sketch-like edge detection.';

export function apply(buf) {
  const edges = convolve(buf, EDGE_3, 1);
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    // Edges are bright where the image changes fast; invert for a pencil look.
    const v = clampByte(255 - edges.data[i]);
    out[i] = v; out[i + 1] = v; out[i + 2] = v; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
