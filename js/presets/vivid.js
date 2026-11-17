// Vivid presets — colour-forward looks.
export const PRESETS = [
  {
    id: 'vivid-pop', name: 'Colour Pop', description: 'Maximum saturation and vibrance.',
    adjustments: { saturation: 35, vibrance: 30, contrast: 15 },
    filters: [],
  },
  {
    id: 'vivid-golden', name: 'Golden Hour', description: 'Warm, glowing, high vibrance.',
    adjustments: { warmth: 35, vibrance: 25, highlights: 10, saturation: 12 },
    filters: [{ id: 'warm' }],
  },
  {
    id: 'vivid-cool', name: 'Arctic', description: 'Icy blues, crisp and clean.',
    adjustments: { saturation: 15, contrast: 12, highlights: 8 },
    filters: [{ id: 'cool' }],
  },
  {
    id: 'vivid-invert', name: 'Negative Pop', description: 'Inverted colours, surprisingly vivid.',
    adjustments: { saturation: 20, contrast: 10 },
    filters: [{ id: 'invert' }],
  },
];
