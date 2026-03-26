export const forgeTokens = {
  palette: {
    background: {
      default: '#06080f',
      surface: '#0d111a',
      panel: '#131925',
      elevated: '#1a2130',
    },
    text: {
      primary: '#f3efe4',
      secondary: '#a5adbf',
      muted: '#727b8f',
    },
    accent: {
      ember: '#c75a32',
      gold: '#d2a262',
      steel: '#4d607a',
      critical: '#c84848',
      success: '#4f8f73',
      warning: '#c28738',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.16)',
    },
  },
  gradients: {
    page:
      'radial-gradient(circle at top, rgba(199, 90, 50, 0.14), transparent 25%), linear-gradient(180deg, #090b12 0%, #06080f 100%)',
    card: 'linear-gradient(180deg, rgba(22, 28, 41, 0.94) 0%, rgba(13, 17, 26, 0.98) 100%)',
    spotlight:
      'radial-gradient(circle at top right, rgba(210, 162, 98, 0.16), transparent 32%), linear-gradient(180deg, rgba(17, 22, 33, 0.95) 0%, rgba(9, 11, 18, 1) 100%)',
  },
  shadow: {
    card: '0 18px 40px rgba(0, 0, 0, 0.26)',
    glow: '0 0 0 1px rgba(210, 162, 98, 0.12), 0 20px 45px rgba(0, 0, 0, 0.35)',
  },
  radius: {
    card: 20,
    pill: 999,
  },
} as const
