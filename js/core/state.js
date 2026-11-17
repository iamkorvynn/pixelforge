// Editor state — the single source of truth for one editing session.
// Kept separate from the DOM so it can be serialized (recipes, history)
// and tested without a browser.
import { DEFAULT_ADJUSTMENTS } from './pixel.js';
import { DEFAULT_TRANSFORM } from './transform.js';
import { fullCrop } from './crop.js';

export function createState(imageWidth, imageHeight) {
  return {
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    filters: [], // [{ id, strength? }]
    transform: { ...DEFAULT_TRANSFORM },
    crop: fullCrop(imageWidth, imageHeight),
    imageWidth,
    imageHeight,
  };
}

export function resetAdjustments(state) {
  return { ...state, adjustments: { ...DEFAULT_ADJUSTMENTS } };
}

export function resetFilters(state) {
  return { ...state, filters: [] };
}

export function resetAll(state) {
  return {
    ...state,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    filters: [],
    transform: { ...DEFAULT_TRANSFORM },
    crop: fullCrop(state.imageWidth, state.imageHeight),
  };
}

export function addFilter(state, id, strength) {
  const filters = [...state.filters, { id, ...(strength !== undefined ? { strength } : {}) }];
  return { ...state, filters };
}

export function removeFilter(state, index) {
  const filters = state.filters.filter((_, i) => i !== index);
  return { ...state, filters };
}

export function setAdjustment(state, key, value) {
  if (!(key in DEFAULT_ADJUSTMENTS)) throw new Error(`Unknown adjustment: ${key}`);
  return { ...state, adjustments: { ...state.adjustments, [key]: value } };
}

// Apply a recipe object onto a state (keeps the current image/crop).
export function applyRecipeToState(state, recipe) {
  return {
    ...state,
    adjustments: { ...recipe.adjustments },
    filters: recipe.filters.map((f) => ({ ...f })),
  };
}

// Extract the recipe-shaped data out of a state.
export function stateToRecipeData(state) {
  return {
    adjustments: { ...state.adjustments },
    filters: state.filters.map((f) => ({ ...f })),
  };
}
