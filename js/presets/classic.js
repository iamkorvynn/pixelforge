// Classic presets — clean, everyday looks.
export const PRESETS = [
  {
    id: 'classic-original', name: 'Original', description: 'No edits at all.',
    adjustments: {}, filters: [],
  },
  {
    id: 'classic-bright', name: 'Bright & Airy', description: 'Lifted exposure and gentle warmth.',
    adjustments: { exposure: 18, brightness: 8, warmth: 10, highlights: 12 },
    filters: [],
  },
  {
    id: 'classic-crisp', name: 'Crisp', description: 'Extra contrast and a touch of sharpening.',
    adjustments: { contrast: 22, vibrance: 12 },
    filters: [{ id: 'sharpen', strength: 1 }],
  },
  {
    id: 'classic-moody', name: 'Moody', description: 'Dark, low-key, desaturated.',
    adjustments: { exposure: -18, contrast: 18, saturation: -25, shadows: -10 },
    filters: [{ id: 'vignette', strength: 55 }],
  },
  {
    id: 'classic-sunny', name: 'Sunny Day', description: 'Warm and punchy, like afternoon light.',
    adjustments: { warmth: 28, saturation: 18, contrast: 10, vibrance: 15 },
    filters: [{ id: 'warm' }],
  },
];
