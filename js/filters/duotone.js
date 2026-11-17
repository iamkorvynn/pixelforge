// Duotone — map luminance onto a two-colour gradient (default: deep blue -> warm paper).
import { clampByte } from '../core/utils.js';
import { luminance } from '../core/color.js';
import { lerp } from '../core/utils.js';

export const id = 'duotone';
export const label = 'Duotone';
export const description = 'Two-colour print look from the shadows to the highlights.';

export function duotonePixel(r, g, b, dark = [18, 28, 64], light = [255, 226, 178]) {
  const l = luminance(r, g, b) / 255;
  return [
    clampByte(lerp(dark[0], light[0], l)),
    clampByte(lerp(dark[1], light[1], l)),
    clampByte(lerp(dark[2], light[2], l)),
  ];
}

export function apply(buf, dark, light) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const [r, g, b] = duotonePixel(buf.data[i], buf.data[i + 1], buf.data[i + 2], dark, light);
    out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
