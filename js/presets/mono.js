// Mono presets — black & white family.
export const PRESETS = [
  {
    id: 'mono-classic', name: 'Classic B&W', description: 'Straight desaturated monochrome.',
    adjustments: { saturation: -100, contrast: 10 },
    filters: [],
  },
  {
    id: 'mono-noir', name: 'Noir', description: 'Hard contrast, crushed blacks.',
    adjustments: { contrast: 25 },
    filters: [{ id: 'noir' }, { id: 'vignette', strength: 40 }],
  },
  {
    id: 'mono-soft', name: 'Soft Grey', description: 'Low contrast, gentle greys.',
    adjustments: { saturation: -100, contrast: -18, brightness: 8 },
    filters: [{ id: 'fade' }],
  },
  {
    id: 'mono-sketch', name: 'Sketch', description: 'Pencil-outline drawing.',
    adjustments: {},
    filters: [{ id: 'outline' }],
  },
];
