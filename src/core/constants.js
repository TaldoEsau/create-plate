/**
 * Constantes globais e parâmetros de calibração física da placa personalizada.
 */

export const DEFAULT_DIMENSIONS = {
  widthMm: 110,         // 11 cm
  heightMm: 150,        // 15 cm
  thicknessMm: 6,       // Espessura do acrílico (6mm)
  baseDepthMm: 55,      // Profundidade da base horizontal (55mm)
  tiltAngleDeg: 82,     // Ângulo de inclinação ergonômico do display de balcão
  cornerChamferMm: 3    // Chanfro sutil nos cantos superiores
};

export const GOOGLE_COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
  dark: '#202124',
  gray: '#5f6368'
};

export const COLOR_PRESETS = [
  { name: 'Preto Clássico', color: '#000000' },
  { name: 'Azul Google', color: '#1a73e8' },
  { name: 'Verde Google', color: '#1e8e3e' },
  { name: 'Vermelho Google', color: '#d93025' },
  { name: 'Amarelo Google', color: '#f29900' },
  { name: 'Azul Marinho', color: '#0f172a' }
];

export const ACRYLIC_MATERIAL = {
  color: 0xf5faff,
  transmission: 0.94,
  opacity: 1,
  transparent: true,
  roughness: 0.04,
  metalness: 0.05,
  ior: 1.491,          // PMMA (Acrílico)
  thickness: 6.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  specularIntensity: 1.0,
  specularColor: 0xffffff
};

export const PRINT_SPEC = {
  targetDpi: 300,
  // 110 mm / 25.4 * 300 = 1299.2 px
  masterWidthPx: 1299,
  // 150 mm / 25.4 * 300 = 1771.6 px
  masterHeightPx: 1772,
  previewWidthPx: 700,
  previewHeightPx: 955
};
