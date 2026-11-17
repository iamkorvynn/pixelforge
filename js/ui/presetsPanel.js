// Presets panel — renders the preset groups as clickable cards and the
// active filter chain as removable chips.
import { PRESET_GROUPS, getPreset } from '../presets/index.js';
import { FILTER_MAP, STRENGTH_RANGES } from '../filters/index.js';

export function buildPresetStrip(container, onPick) {
  container.innerHTML = '';
  for (const group of PRESET_GROUPS) {
    const heading = document.createElement('div');
    heading.className = 'preset-group-label';
    heading.textContent = group.label;
    container.appendChild(heading);
    for (const preset of group.presets) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'preset-card';
      card.dataset.preset = preset.id;
      card.title = preset.description;
      card.innerHTML = `<span class="preset-swatch preset-swatch-${preset.id}"></span><span class="preset-name">${preset.name}</span>`;
      card.addEventListener('click', () => onPick(preset.id));
      container.appendChild(card);
    }
  }
}

export function markActivePreset(container, presetId) {
  container.querySelectorAll('.preset-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.preset === presetId);
  });
}

// Render the active filter chain as chips with an × to remove each one.
// Filters that take a strength get a small slider to tune it live.
export function renderFilterChips(container, filters, onRemove, onStrength) {
  container.innerHTML = '';
  if (filters.length === 0) {
    container.innerHTML = '<span class="filter-empty">No filters applied — pick one below.</span>';
    return;
  }
  filters.forEach((step, i) => {
    const filter = FILTER_MAP[step.id];
    const chip = document.createElement('span');
    chip.className = 'filter-chip';
    chip.innerHTML = `<span>${filter ? filter.label : step.id}</span><button type="button" aria-label="Remove ${filter ? filter.label : step.id}">×</button>`;
    chip.querySelector('button').addEventListener('click', () => onRemove(i));
    container.appendChild(chip);
    if (typeof step.strength === 'number' && onStrength) {
      const range = STRENGTH_RANGES[step.id] || { min: 0, max: 100 };
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = String(range.min);
      slider.max = String(range.max);
      slider.step = '1';
      slider.value = String(step.strength);
      slider.className = 'filter-strength';
      slider.title = `Strength of ${filter ? filter.label : step.id}`;
      slider.setAttribute('aria-label', `Strength of ${filter ? filter.label : step.id}`);
      slider.addEventListener('input', () => onStrength(i, Number(slider.value), false));
      slider.addEventListener('change', () => onStrength(i, Number(slider.value), true));
      container.appendChild(slider);
    }
  });
}

// Render the filter picker grid (one button per hand-written filter).
export function buildFilterGrid(container, onPick) {
  container.innerHTML = '';
  for (const filter of Object.values(FILTER_MAP)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.dataset.filter = filter.id;
    btn.title = filter.description;
    btn.textContent = filter.label;
    btn.addEventListener('click', () => onPick(filter.id));
    container.appendChild(btn);
  }
}

export { getPreset };
