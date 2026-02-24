export const colors = {
  bgPrimary: '#040404',
  bgElevated: '#0a0a0a',
  bgSurface: '#111111',
  bgSurfaceHover: '#1a1a1a',

  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.1)',
  borderStrong: 'rgba(255,255,255,0.16)',

  textPrimary: '#f5f5f5',
  textSecondary: '#a0a0a0',
  textTertiary: '#666666',

  accentMint: '#ADFFA6',
  accentCyan: '#8AF2E9',
  accentMintMuted: 'rgba(173,255,166,0.12)',
  accentCyanMuted: 'rgba(138,242,233,0.12)',

  glassBg: 'rgba(255,255,255,0.03)',
  glassBgHover: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.08)',

  red: '#ef4444',
  redMuted: 'rgba(239,68,68,0.1)',
  redBorder: 'rgba(239,68,68,0.2)',
  yellow: '#eab308',
  yellowMuted: 'rgba(234,179,8,0.1)',
  yellowBorder: 'rgba(234,179,8,0.2)',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 36,
};

export const font = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const glass = {
  backgroundColor: colors.glassBg,
  borderWidth: 1,
  borderColor: colors.glassBorder,
};
