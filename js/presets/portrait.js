// Portrait presets — skin-friendly, gentle looks.
export const PRESETS = [
  {
    id: 'portrait-soft', name: 'Soft Skin', description: 'Gentle warmth, softened contrast.',
    adjustments: { warmth: 12, contrast: -10, brightness: 6, saturation: -5 },
    filters: [{ id: 'blur', strength: 1 }],
  },
  {
    id: 'portrait-glow', name: 'Glow', description: 'Bright, warm, lightly faded.',
    adjustments: { exposure: 12, warmth: 18, highlights: 15, contrast: -8 },
    filters: [{ id: 'fade' }],
  },
  {
    id: 'portrait-dramatic', name: 'Dramatic', description: 'High contrast with a vignette frame.',
    adjustments: { contrast: 30, saturation: -10, shadows: -12 },
    filters: [{ id: 'vignette', strength: 60 }],
  },
];
