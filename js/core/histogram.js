// Histogram — 256-bin counts per channel plus luminance, and summary stats
// (mean brightness, % of pixels clipped to pure black / pure white).
import { luminance } from './color.js';

export function computeHistogram(buf) {
  const red = new Array(256).fill(0);
  const green = new Array(256).fill(0);
  const blue = new Array(256).fill(0);
  const lum = new Array(256).fill(0);
  const { data } = buf;
  for (let i = 0; i < data.length; i += 4) {
    red[data[i]] += 1;
    green[data[i + 1]] += 1;
    blue[data[i + 2]] += 1;
    lum[Math.round(luminance(data[i], data[i + 1], data[i + 2]))] += 1;
  }
  return { red, green, blue, luminance: lum, total: buf.width * buf.height };
}

export function histogramStats(hist) {
  let sum = 0;
  for (let v = 0; v < 256; v++) sum += v * hist.luminance[v];
  const mean = hist.total ? sum / hist.total : 0;
  const clippedBlack = hist.total ? hist.luminance[0] / hist.total : 0;
  const clippedWhite = hist.total ? hist.luminance[255] / hist.total : 0;
  return { mean: Math.round(mean * 10) / 10, clippedBlack, clippedWhite };
}

// Peak-normalize one channel's bins to 0..1 for drawing.
export function normalizeBins(bins) {
  const peak = Math.max(...bins, 1);
  return bins.map((v) => v / peak);
}
