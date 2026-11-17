// Sliders panel — builds one labelled slider per adjustment and keeps the
// value badges in sync. All slider changes go through onChange(key, value).
import { DEFAULT_ADJUSTMENTS } from '../core/pixel.js';

export const SLIDER_DEFS = [
  { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'vibrance', label: 'Vibrance', min: -100, max: 100 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100 },
  { key: 'hue', label: 'Hue shift', min: -180, max: 180, unit: '°' },
];

export function buildSliders(container, adjustments, onChange) {
  container.innerHTML = '';
  const inputs = {};
  for (const def of SLIDER_DEFS) {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.innerHTML = `
      <div class="slider-head">
        <label for="slider-${def.key}">${def.label}</label>
        <button class="slider-reset" type="button" data-key="${def.key}" title="Reset ${def.label} to 0">×</button>
        <span class="slider-value" id="value-${def.key}">${adjustments[def.key]}${def.unit || ''}</span>
      </div>
      <input type="range" id="slider-${def.key}" min="${def.min}" max="${def.max}" step="1"
        value="${adjustments[def.key]}" data-key="${def.key}" aria-label="${def.label}">`;
    const input = row.querySelector('input');
    input.addEventListener('input', () => {
      const value = Number(input.value);
      row.querySelector('.slider-value').textContent = `${value}${def.unit || ''}`;
      onChange(def.key, value);
    });
    row.querySelector('.slider-reset').addEventListener('click', () => {
      input.value = 0;
      row.querySelector('.slider-value').textContent = `0${def.unit || ''}`;
      onChange(def.key, 0);
    });
    container.appendChild(row);
    inputs[def.key] = input;
  }
  return inputs;
}

// Push a whole adjustments object into the sliders (after undo/preset/recipe).
export function syncSliders(inputs, adjustments) {
  for (const [key, input] of Object.entries(inputs)) {
    input.value = adjustments[key];
    const badge = document.querySelector(`#value-${key}`);
    if (badge) badge.textContent = String(adjustments[key]);
  }
}
