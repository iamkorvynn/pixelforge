// Sharpen — 3x3 sharpen convolution kernel.
import { sharpen } from '../core/convolution.js';

export const id = 'sharpen';
export const label = 'Sharpen';
export const description = 'Crispens edges with a sharpen kernel.';

export function apply(buf, strength = 1) {
  return sharpen(buf, strength);
}
