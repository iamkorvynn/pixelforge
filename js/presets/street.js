// Street presets — urban, gritty, high-contrast looks.
export const PRESETS = [
  {
    id: 'street-neon', name: 'Neon Night', description: 'City at night: cool shadows, hot highlights.',
    adjustments: { warmth: -12, contrast: 28, saturation: 25, shadows: -15 },
    filters: [{ id: 'cool' }, { id: 'vignette', strength: 50 }],
  },
  {
    id: 'street-grit', name: 'Grit', description: 'Grainy, contrasty, documentary street.',
    adjustments: { contrast: 25, saturation: -20, brightness: -5 },
    filters: [{ id: 'grain', strength: 30 }, { id: 'vignette', strength: 35 }],
  },
  {
    id: 'street-solar', name: 'Solar Street', description: 'Solarised tones for a surreal city.',
    adjustments: { saturation: 15, contrast: 10 },
    filters: [{ id: 'solarize', strength: 140 }],
  },
  {
    id: 'street-threshold', name: 'Poster Street', description: 'Hard graphic black & white.',
    adjustments: { contrast: 20 },
    filters: [{ id: 'threshold', strength: 128 }],
  },
];
