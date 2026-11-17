// Preset registry — all preset packs in one list, in display order.
import { PRESETS as classic } from './classic.js';
import { PRESETS as film } from './film.js';
import { PRESETS as mono } from './mono.js';
import { PRESETS as vivid } from './vivid.js';
import { PRESETS as portrait } from './portrait.js';
import { PRESETS as seasonal } from './seasonal.js';
import { PRESETS as street } from './street.js';

export const PRESET_GROUPS = [
  { id: 'classic', label: 'Classic', presets: classic },
  { id: 'film', label: 'Film', presets: film },
  { id: 'mono', label: 'Mono', presets: mono },
  { id: 'vivid', label: 'Vivid', presets: vivid },
  { id: 'portrait', label: 'Portrait', presets: portrait },
  { id: 'seasonal', label: 'Seasonal', presets: seasonal },
  { id: 'street', label: 'Street', presets: street },
];

export const ALL_PRESETS = PRESET_GROUPS.flatMap((g) => g.presets);
export const PRESET_MAP = Object.fromEntries(ALL_PRESETS.map((p) => [p.id, p]));

export function getPreset(id) {
  return PRESET_MAP[id] || null;
}

// Convert a preset into a recipe-shaped object (so presets and recipes
// share the same apply path in the editor).
export function presetToRecipe(preset) {
  return {
    kind: 'pixelforge-recipe',
    version: 1,
    name: preset.name,
    adjustments: preset.adjustments,
    filters: preset.filters,
  };
}
