// Recipes panel — save the current look as a named recipe, copy it as text,
// import one by pasting, and keep a local library in localStorage.
// All recipe JSON work goes through js/core/recipes.js so the format is
// identical in the app, in tests and in the bundled recipes/*.json files.
import { createRecipe, serializeRecipe, parseRecipe, serializeRecipePretty } from '../core/recipes.js';

const STORAGE_KEY = 'pixelforge.recipes.v1';

export function loadSavedRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveSavedRecipes(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* storage full/blocked */ }
}

export function buildRecipesPanel({ listEl, nameInput, saveBtn, copyBtn, importText, importBtn, downloadBtn, getCurrent, onApply, onStatus }) {
  const render = () => {
    const saved = loadSavedRecipes();
    listEl.innerHTML = '';
    if (saved.length === 0) {
      listEl.innerHTML = '<li class="recipe-empty">No saved recipes yet — tune the image, name the look, save it.</li>';
      return;
    }
    saved.forEach((recipe, i) => {
      const li = document.createElement('li');
      li.className = 'recipe-item';
      li.innerHTML = `
        <button type="button" class="recipe-apply" title="Apply ${recipe.name}">${recipe.name}</button>
        <button type="button" class="recipe-copy" title="Copy recipe text">Copy</button>
        <button type="button" class="recipe-delete" title="Delete ${recipe.name}" aria-label="Delete ${recipe.name}">×</button>`;
      li.querySelector('.recipe-apply').addEventListener('click', () => onApply(recipe));
      li.querySelector('.recipe-copy').addEventListener('click', async () => {
        await navigator.clipboard.writeText(serializeRecipe(recipe));
        onStatus(`Copied recipe “${recipe.name}” — paste it anywhere to share.`);
      });
      li.querySelector('.recipe-delete').addEventListener('click', () => {
        const next = loadSavedRecipes().filter((_, j) => j !== i);
        saveSavedRecipes(next);
        render();
        onStatus(`Deleted recipe “${recipe.name}”.`);
      });
      listEl.appendChild(li);
    });
  };

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) { onStatus('Give the recipe a name first.'); nameInput.focus(); return; }
    const recipe = createRecipe(name, getCurrent().adjustments, getCurrent().filters);
    const saved = loadSavedRecipes();
    saved.unshift(recipe);
    saveSavedRecipes(saved);
    nameInput.value = '';
    render();
    onStatus(`Saved recipe “${name}”.`);
  });

  copyBtn.addEventListener('click', async () => {
    const data = getCurrent();
    const recipe = createRecipe(nameInput.value.trim() || 'My PixelForge look', data.adjustments, data.filters);
    await navigator.clipboard.writeText(serializeRecipe(recipe));
    onStatus('Current look copied as recipe text — share it anywhere.');
  });

  downloadBtn.addEventListener('click', () => {
    const data = getCurrent();
    const recipe = createRecipe(nameInput.value.trim() || 'My PixelForge look', data.adjustments, data.filters);
    const blob = new Blob([serializeRecipePretty(recipe)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${recipe.name.toLowerCase().replace(/[^\w]+/g, '-')}.pixelforge.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    onStatus(`Downloaded “${recipe.name}” as a .json recipe file.`);
  });

  importBtn.addEventListener('click', () => {
    const text = importText.value.trim();
    if (!text) { onStatus('Paste a recipe JSON first.'); return; }
    try {
      const recipe = parseRecipe(text);
      onApply(recipe);
      importText.value = '';
      onStatus(`Imported recipe “${recipe.name}”.`);
    } catch (err) {
      onStatus(err.message);
    }
  });

  render();
  return { render };
}
