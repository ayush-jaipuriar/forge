export const forgeTokens = {
  palette: {
    background: {
      default: '#070910',
      surface: '#0d1018',
      panel: '#151b26',
      elevated: '#1c2431',
      shell: '#10141e',
      nav: '#0b0f18',
    },
    text: {
      primary: '#f4efe6',
      secondary: '#b5bdca',
      muted: '#7b8496',
    },
    accent: {
      ember: '#d46f3c',
      gold: '#f0b37a',
      copper: '#b17d58',
      steel: '#62748d',
      critical: '#d45b5b',
      success: '#5d9277',
      warning: '#cd9648',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.14)',
      accent: 'rgba(212, 111, 60, 0.32)',
    },
  },
  gradients: {
    page:
      'radial-gradient(circle at top left, rgba(212, 111, 60, 0.14), transparent 28%), linear-gradient(180deg, #0b0d15 0%, #070910 100%)',
    card: 'linear-gradient(180deg, rgba(24, 29, 40, 0.96) 0%, rgba(17, 21, 31, 0.98) 100%)',
    panel: 'linear-gradient(180deg, rgba(21, 27, 38, 0.98) 0%, rgba(14, 18, 27, 1) 100%)',
    spotlight:
      'radial-gradient(circle at top right, rgba(240, 179, 122, 0.14), transparent 34%), linear-gradient(180deg, rgba(19, 24, 35, 0.98) 0%, rgba(11, 14, 21, 1) 100%)',
  },
  shadow: {
    card: '0 18px 36px rgba(0, 0, 0, 0.22)',
    glow: '0 0 0 1px rgba(212, 111, 60, 0.12), 0 22px 44px rgba(0, 0, 0, 0.28)',
  },
  radius: {
    base: 4,
    card: 4,
    panel: 5,
    pill: 999,
  },
} as const
