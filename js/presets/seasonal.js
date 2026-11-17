// Seasonal presets — looks for the four seasons.
export const PRESETS = [
  {
    id: 'seasonal-autumn', name: 'Autumn Glow', description: 'Warm reds and golds, like October light.',
    adjustments: { warmth: 30, saturation: 20, contrast: 12, vibrance: 18 },
    filters: [{ id: 'warm' }, { id: 'vignette', strength: 30 }],
  },
  {
    id: 'seasonal-winter', name: 'Winter Frost', description: 'Cold, bright, desaturated snow light.',
    adjustments: { warmth: -25, brightness: 10, saturation: -15, contrast: 8 },
    filters: [{ id: 'cool' }],
  },
  {
    id: 'seasonal-spring', name: 'Spring Bloom', description: 'Fresh, bright, slightly pink.',
    adjustments: { warmth: 8, saturation: 22, brightness: 10, vibrance: 20, hue: 4 },
    filters: [],
  },
  {
    id: 'seasonal-summer', name: 'Summer Haze', description: 'Hot, hazy, faded highlights.',
    adjustments: { exposure: 14, warmth: 22, contrast: -10, saturation: 8 },
    filters: [{ id: 'fade' }],
  },
];
