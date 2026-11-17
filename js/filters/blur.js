// Blur — Gaussian 3x3 convolution, repeatable for strength.
import { blur } from '../core/convolution.js';

export const id = 'blur';
export const label = 'Blur';
export const description = 'Soft Gaussian blur (strength 1–5).';

export function apply(buf, strength = 2) {
  return blur(buf, strength);
}
