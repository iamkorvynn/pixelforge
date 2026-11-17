// Histogram UI — draws the luminance histogram (with faint RGB overlays)
// onto a small canvas in the sidebar, plus a one-line brightness summary.
import { computeHistogram, histogramStats, normalizeBins } from '../core/histogram.js';

export function drawHistogram(canvas, buf, labelEl) {
  const hist = computeHistogram(buf);
  const stats = histogramStats(hist);
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const draw = (bins, color) => {
    const norm = normalizeBins(bins);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x < 256; x++) {
      ctx.lineTo((x / 255) * w, h - norm[x] * (h - 4));
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  draw(hist.red, 'rgba(255,90,80,0.8)');
  draw(hist.green, 'rgba(80,220,120,0.8)');
  draw(hist.blue, 'rgba(90,140,255,0.8)');
  draw(hist.luminance, 'rgba(236,236,241,0.9)');
  if (labelEl) {
    labelEl.textContent = `Mean ${stats.mean} · black ${(stats.clippedBlack * 100).toFixed(1)}% · white ${(stats.clippedWhite * 100).toFixed(1)}%`;
  }
}
