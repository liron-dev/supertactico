export const COLORS = {
  navy: {
    900: '#0a1628',
    800: '#0f2038',
    700: '#152a48',
    600: '#1a3358',
  },
  gold: {
    400: '#f4d03f',
    500: '#d4ac0d',
    600: '#b7950b',
  },
  sea: {
    light: '#2980b9',
    DEFAULT: '#1a5276',
    dark: '#0e3d5c',
  },
  land: {
    light: '#e8c99b',
    DEFAULT: '#d4a574',
    dark: '#c2956b',
  },
  island: {
    light: '#2ecc71',
    DEFAULT: '#27ae60',
    dark: '#229954',
  },
  player: {
    yellow: '#f1c40f',
    blue: '#3498db',
  },
  highlight: {
    selected: '#f4d03f',
    move: '#2ecc71',
    attack: '#e74c3c',
    load: '#3498db',
  },
} as const;

export const TERRAIN_COLORS: Record<string, string> = {
  S: COLORS.sea.DEFAULT,
  L: COLORS.land.DEFAULT,
  I: COLORS.island.DEFAULT,
};

export const TERRAIN_LABELS: Record<string, string> = {
  S: 'Sea',
  L: 'Land',
  I: 'Island',
};
