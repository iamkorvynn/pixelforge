// Film presets — analogue looks built from the hand-written filters.
export const PRESETS = [
  {
    id: 'film-vintage', name: 'Vintage Film', description: 'Faded 70s film with lifted blacks.',
    adjustments: { saturation: -12, contrast: -8, warmth: 15 },
    filters: [{ id: 'vintage' }, { id: 'vignette', strength: 35 }],
  },
  {
    id: 'film-sepia', name: 'Old Sepia', description: 'Antique brown tone.',
    adjustments: { contrast: 8 },
    filters: [{ id: 'sepia' }, { id: 'vignette', strength: 45 }],
  },
  {
    id: 'film-fade', name: 'Matte Fade', description: 'Washed-out matte finish.',
    adjustments: { contrast: -15, saturation: -10 },
    filters: [{ id: 'fade' }],
  },
  {
    id: 'film-duotone', name: 'Blue Print', description: 'Two-colour print look.',
    adjustments: { contrast: 12 },
    filters: [{ id: 'duotone' }],
  },
  {
    id: 'film-poster', name: 'Poster Pop', description: 'Flat graphic poster colours.',
    adjustments: { saturation: 25, contrast: 15 },
    filters: [{ id: 'posterize', strength: 5 }],
  },
];
