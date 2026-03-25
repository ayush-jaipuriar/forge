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
  shadow: {
    card: '0 18px 40px rgba(0, 0, 0, 0.26)',
  },
  radius: {
    card: 20,
    pill: 999,
  },
} as const
