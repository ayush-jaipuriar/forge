import { alpha, createTheme } from '@mui/material/styles'
import { forgeTokens } from '@/app/theme/tokens'

export const forgeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: forgeTokens.palette.accent.ember,
      light: forgeTokens.palette.accent.gold,
      dark: forgeTokens.palette.accent.copper,
    },
    secondary: {
      main: forgeTokens.palette.accent.steel,
    },
    info: {
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
    borderRadius: forgeTokens.radius.base,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      fontWeight: 800,
      letterSpacing: '-0.06em',
      lineHeight: 0.96,
    },
    h2: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      fontSize: 'clamp(1.85rem, 3vw, 2.55rem)',
      fontWeight: 700,
      letterSpacing: '-0.05em',
      lineHeight: 1.02,
    },
    h3: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      fontSize: '1.08rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.15,
    },
    subtitle1: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      fontSize: '0.92rem',
      fontWeight: 600,
      lineHeight: 1.45,
    },
    overline: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.2em',
    },
    body1: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      lineHeight: 1.65,
    },
    body2: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      lineHeight: 1.6,
    },
    caption: {
      fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
      fontSize: '0.72rem',
      letterSpacing: '0.04em',
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'dark',
        },
        body: {
          background: forgeTokens.gradients.page,
          color: forgeTokens.palette.text.primary,
        },
        '#root': {
          minHeight: '100vh',
        },
        '::selection': {
          backgroundColor: alpha(forgeTokens.palette.accent.ember, 0.38),
          color: forgeTokens.palette.text.primary,
        },
      },
    },
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
          boxShadow: forgeTokens.shadow.glow,
          borderColor: forgeTokens.palette.border.subtle,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          border: `1px solid ${forgeTokens.palette.border.strong}`,
          backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.62),
          fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          height: 30,
        },
        icon: {
          marginLeft: 8,
        },
        label: {
          paddingInline: 11,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16,
          minHeight: 40,
        },
        containedPrimary: {
          background: forgeTokens.palette.accent.ember,
          color: forgeTokens.palette.background.default,
          '&:hover': {
            background: forgeTokens.palette.accent.gold,
          },
        },
        outlined: {
          borderColor: forgeTokens.palette.border.strong,
          backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.42),
        },
        text: {
          color: forgeTokens.palette.text.secondary,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: forgeTokens.gradients.panel,
          borderLeft: `1px solid ${forgeTokens.palette.border.strong}`,
        },
      },
    },
  },
})
