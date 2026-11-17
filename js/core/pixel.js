// The main adjustment pipeline: brightness / contrast / saturation / hue /
// exposure / warmth / highlights / shadows / vibrance, applied per pixel.
// Every adjustment is a pure function of (pixel, value) so the pipeline is
// fully testable on tiny pixel arrays without a canvas.
import { clamp, clampByte, clamp01 } from './utils.js';
import { luminance, rgbToHsl, hslToRgb, applyWarmth, shiftHue } from './color.js';

// Brightness: value in [-100, 100] -> add value * 1.27 to each channel.
export function adjustBrightness(r, g, b, value) {
  const d = value * 1.27;
  return [r + d, g + d, b + d];
}

// Contrast: value in [-100, 100]. factor = (259*(v+255)) / (255*(259-v))
// with v = value * 2.55, the classic formula.
export function adjustContrast(r, g, b, value) {
  const v = value * 2.55;
  const factor = (259 * (v + 255)) / (255 * (259 - v));
  return [
    factor * (r - 128) + 128,
    factor * (g - 128) + 128,
    factor * (b - 128) + 128,
  ];
}

// Saturation: value in [-100, 100]. 0 = unchanged, -100 = grey, +100 = x2.
export function adjustSaturation(r, g, b, value) {
  const l = luminance(r, g, b);
  const t = clamp01(1 + value / 100);
  return [l + (r - l) * t, l + (g - l) * t, l + (b - l) * t];
}

// Exposure: value in [-100, 100] -> multiply by 2^(value/100).
export function adjustExposure(r, g, b, value) {
  const f = Math.pow(2, value / 100);
  return [r * f, g * f, b * f];
}

// Highlights: lift only the bright end (luma > 128).
export function adjustHighlights(r, g, b, value) {
  const l = luminance(r, g, b) / 255;
  const w = clamp01((l - 0.5) * 2); // 0 below mid, 1 at white
  const d = value * 1.27 * w;
  return [r + d, g + d, b + d];
}

// Shadows: lift only the dark end (luma < 128).
export function adjustShadows(r, g, b, value) {
  const l = luminance(r, g, b) / 255;
  const w = clamp01((0.5 - l) * 2);
  const d = value * 1.27 * w;
  return [r + d, g + d, b + d];
}

// Vibrance: like saturation but protects already-saturated pixels.
export function adjustVibrance(r, g, b, value) {
  const [h, s, l] = rgbToHsl(r, g, b);
  const t = clamp01(1 + (value / 100) * (1 - s));
  return hslToRgb(h, s * t, l);
}

// Default (neutral) adjustment state. Every value is a slider in [-100, 100]
// except hue, which is in degrees [-180, 180].
export const DEFAULT_ADJUSTMENTS = Object.freeze({
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  warmth: 0,
  highlights: 0,
  shadows: 0,
  vibrance: 0,
});

// Apply the full adjustment set to one pixel. Order matters: exposure first,
// then brightness/contrast, then colour work, then highlights/shadows.
export function applyAdjustmentsToPixel(r, g, b, adj) {
  let [nr, ng, nb] = [r, g, b];
  if (adj.exposure) [nr, ng, nb] = adjustExposure(nr, ng, nb, adj.exposure);
  if (adj.brightness) [nr, ng, nb] = adjustBrightness(nr, ng, nb, adj.brightness);
  if (adj.contrast) [nr, ng, nb] = adjustContrast(nr, ng, nb, adj.contrast);
  if (adj.highlights) [nr, ng, nb] = adjustHighlights(nr, ng, nb, adj.highlights);
  if (adj.shadows) [nr, ng, nb] = adjustShadows(nr, ng, nb, adj.shadows);
  if (adj.saturation) [nr, ng, nb] = adjustSaturation(nr, ng, nb, adj.saturation);
  if (adj.vibrance) [nr, ng, nb] = adjustVibrance(nr, ng, nb, adj.vibrance);
  if (adj.hue) [nr, ng, nb] = shiftHue(nr, ng, nb, adj.hue);
  if (adj.warmth) [nr, ng, nb] = applyWarmth(nr, ng, nb, adj.warmth);
  return [clampByte(nr), clampByte(ng), clampByte(nb)];
}

// Apply adjustments to a whole buffer, returning a new buffer.
export function applyAdjustments(buf, adj) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    const [r, g, b] = applyAdjustmentsToPixel(buf.data[i], buf.data[i + 1], buf.data[i + 2], adj);
    out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}

// True when every adjustment is neutral (pipeline can be skipped).
export function isNeutral(adj) {
  return Object.values(adj).every((v) => v === 0);
}
