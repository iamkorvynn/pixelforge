// Colour-space helpers: RGB <-> HSL and luminance.
// Implemented by hand (no libraries) so the editor stays dependency-free.
import { clamp01 } from './utils.js';

// Rec. 601 luma, the classic perceptual brightness of a pixel.
export function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// r,g,b in 0..255 -> h in 0..360, s,l in 0..1
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

// h in 0..360, s,l in 0..1 -> r,g,b in 0..255
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  s = clamp01(s); l = clamp01(l);
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(h + 1 / 3) * 255),
    Math.round(hue2rgb(h) * 255),
    Math.round(hue2rgb(h - 1 / 3) * 255),
  ];
}

// Shift the hue of one pixel by `degrees` (positive = clockwise on the wheel).
export function shiftHue(r, g, b, degrees) {
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToRgb(h + degrees, s, l);
}

// Warmth: positive values push red/yellow, negative push blue.
export function applyWarmth(r, g, b, amount) {
  // amount in [-100, 100]
  const t = amount / 100;
  return [
    r + 30 * t,
    g + 8 * t,
    b - 30 * t,
  ];
}
