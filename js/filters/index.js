// Filter registry — every hand-written filter in one list, in display order.
// Each entry: { id, label, description, apply(buffer, strength?) }.
import * as grayscale from './grayscale.js';
import * as sepia from './sepia.js';
import * as vintage from './vintage.js';
import * as invert from './invert.js';
import * as blur from './blur.js';
import * as sharpen from './sharpen.js';
import * as vignette from './vignette.js';
import * as duotone from './duotone.js';
import * as noir from './noir.js';
import * as fade from './fade.js';
import * as cool from './cool.js';
import * as warm from './warm.js';
import * as posterize from './posterize.js';
import * as outline from './outline.js';
import * as solarize from './solarize.js';
import * as threshold from './threshold.js';
import * as emboss from './emboss.js';
import * as grain from './grain.js';
import * as clarity from './clarity.js';

export const FILTERS = [
  grayscale, sepia, vintage, invert, noir, fade, duotone,
  warm, cool, vignette, blur, sharpen, posterize, outline,
  solarize, threshold, emboss, grain, clarity,
];

export const FILTER_MAP = Object.fromEntries(FILTERS.map((f) => [f.id, f]));

export function getFilter(id) {
  return FILTER_MAP[id] || null;
}

export function listFilters() {
  return FILTERS.map(({ id, label, description }) => ({ id, label, description }));
}
