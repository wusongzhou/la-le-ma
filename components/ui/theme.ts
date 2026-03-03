// Simple theme for the app

export const Colors = {
  // New color palette
  yellow: '#FFF7CD',    // 浅黄色
  orange: '#FDC3A1',   // 浅橙色
  pink: '#FB9B8F',     // 浅粉色
  magenta: '#F57799',   // 玫红色

  // Keep mint for button
  mint: '#7FCC9E',
  mintLight: '#A8E6BE',
  mintDark: '#5DB87A',

  sky: '#7CB8DC',
  skyLight: '#A8D0E8',
  skyDark: '#5A9AC4',

  background: '#FFFDF1',

  text: {
    primary: '#4A4A4A',
    secondary: '#6B6B6B',
    light: '#FFFFFF',
    mint: '#4A9A68',
    pink: '#D47888',
    sky: '#4A7A9A',
  },

  border: {
    mint: '#5DB87A',
    pink: '#FB9B8F',
    sky: '#5A9AC4',
    orange: '#FDC3A1',
    yellow: '#E5C450',
  },

  sketch: {
    dark: '#4A4A4A',
    medium: '#6B6B6B',
    light: '#9A9A9A',
    mint: '#7FCC9E',
    pink: '#FB9B8F',
    sky: '#7CB8DC',
    yellow: '#F5D76E',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const DoodleShadows = {
  sketch: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 5,
  },
  pressed: {
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 1,
  },
};

export const FontFamily = {
  regular: 'Sarasa',
  medium: 'Sarasa',
  bold: 'Sarasa',
  system: 'System',
  mono: 'Sarasa',
};
