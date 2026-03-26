import { alpha, createTheme } from '@mui/material/styles'
import { forgeTokens } from '@/app/theme/tokens'

export const forgeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: forgeTokens.palette.accent.ember,
      light: forgeTokens.palette.accent.gold,
    },
    secondary: {
      main: forgeTokens.palette.accent.steel,
    },
    background: {
      default: forgeTokens.palette.background.default,
      paper: forgeTokens.palette.background.panel,
    },
    text: {
      primary: forgeTokens.palette.text.primary,
      secondary: forgeTokens.palette.text.secondary,
    },
    success: {
      main: forgeTokens.palette.accent.success,
    },
    warning: {
      main: forgeTokens.palette.accent.warning,
    },
    error: {
      main: forgeTokens.palette.accent.critical,
    },
    divider: forgeTokens.palette.border.subtle,
  },
  shape: {
    borderRadius: forgeTokens.radius.card,
  },
  typography: {
    fontFamily: '"Sora", "Avenir Next", "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      fontWeight: 700,
      letterSpacing: '-0.06em',
    },
    h2: {
      fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
      fontWeight: 600,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontSize: '1.15rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    overline: {
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
    },
    body1: {
      lineHeight: 1.65,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${forgeTokens.palette.border.subtle}`,
          boxShadow: forgeTokens.shadow.card,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: forgeTokens.gradients.card,
          backdropFilter: 'blur(14px)',
          boxShadow: forgeTokens.shadow.glow,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: forgeTokens.radius.pill,
          border: `1px solid ${forgeTokens.palette.border.strong}`,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 16,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${forgeTokens.palette.accent.ember} 0%, ${forgeTokens.palette.accent.gold} 100%)`,
          color: forgeTokens.palette.background.default,
          '&:hover': {
            background: `linear-gradient(135deg, ${forgeTokens.palette.accent.gold} 0%, ${forgeTokens.palette.accent.ember} 100%)`,
          },
        },
        outlined: {
          borderColor: forgeTokens.palette.border.strong,
          backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.45),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: forgeTokens.gradients.spotlight,
          borderLeft: `1px solid ${forgeTokens.palette.border.strong}`,
        },
      },
    },
  },
})
