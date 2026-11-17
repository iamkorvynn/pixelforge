// Pipeline — compose adjustments + filters into one render pass over a buffer.
// Order: adjustments first (exposure/brightness/contrast/colour), then the
// active filter chain in the order the user added them, then vignette last
// (it is a framing effect, not a colour effect).
import { applyAdjustments, isNeutral } from './pixel.js';
import { getFilter } from '../filters/index.js';

// A pipeline step is either { type: 'filter', id, strength } or the
// adjustments object itself. `run` returns a new buffer; input is untouched.
export function runPipeline(buf, adjustments, filterSteps = []) {
  let current = buf;
  if (!isNeutral(adjustments)) current = applyAdjustments(current, adjustments);
  for (const step of filterSteps) {
    const filter = getFilter(step.id);
    if (!filter) continue; // unknown filter ids are skipped, never crash
    current = filter.apply(current, step.strength);
  }
  return current;
}

// Describe the current pipeline in words (shown in the status bar).
export function describePipeline(adjustments, filterSteps) {
  const parts = [];
  if (!isNeutral(adjustments)) {
    const active = Object.entries(adjustments)
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`);
    parts.push(`Adjust: ${active.join(', ')}`);
  }
  for (const step of filterSteps) {
    const filter = getFilter(step.id);
    parts.push(filter ? filter.label : step.id);
  }
  return parts.length ? parts.join(' → ') : 'Original (no edits)';
}
