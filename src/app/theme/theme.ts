import { alpha, createTheme } from '@mui/material/styles'
import { getForgeTokens, type ForgeThemeMode } from '@/app/theme/tokens'

export function createForgeTheme(mode: ForgeThemeMode) {
  const tokens = getForgeTokens(mode)
  const focusHalo = mode === 'dark' ? tokens.palette.background.shell : tokens.palette.background.elevated

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.palette.accent.ember,
        light: tokens.palette.accent.gold,
        dark: tokens.palette.accent.copper,
      },
      secondary: {
        main: tokens.palette.accent.steel,
      },
      info: {
        main: tokens.palette.accent.steel,
      },
      background: {
        default: tokens.palette.background.default,
        paper: tokens.palette.background.paper,
      },
      text: {
        primary: tokens.palette.text.primary,
        secondary: tokens.palette.text.secondary,
      },
      success: {
        main: tokens.palette.accent.success,
      },
      warning: {
        main: tokens.palette.accent.warning,
      },
      error: {
        main: tokens.palette.accent.critical,
      },
      divider: tokens.palette.border.subtle,
    },
    shape: {
      borderRadius: tokens.radius.control,
    },
    typography: {
      fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
      h1: {
        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
        fontWeight: 760,
        letterSpacing: '-0.064em',
        lineHeight: 0.96,
        textWrap: 'balance',
      },
      h2: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        fontSize: 'clamp(1.85rem, 3vw, 2.55rem)',
        fontWeight: 720,
        letterSpacing: '-0.052em',
        lineHeight: 1.02,
        textWrap: 'balance',
      },
      h3: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        fontSize: '1.08rem',
        fontWeight: 700,
        letterSpacing: '-0.032em',
        lineHeight: 1.15,
        textWrap: 'balance',
      },
      subtitle1: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        fontSize: '0.92rem',
        fontWeight: 620,
        lineHeight: 1.45,
      },
      overline: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        fontSize: '0.68rem',
        fontWeight: 760,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      },
      body1: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        lineHeight: 1.65,
        textWrap: 'pretty',
      },
      body2: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        lineHeight: 1.6,
        textWrap: 'pretty',
      },
      caption: {
        fontFamily: '"Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace',
        fontSize: '0.72rem',
        letterSpacing: '0.04em',
      },
      button: {
        fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
        fontWeight: 720,
        textTransform: 'none',
        letterSpacing: '-0.005em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          '@keyframes forgePageIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(8px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
          body: {
            background: tokens.gradients.page,
            color: tokens.palette.text.primary,
          },
          '#root': {
            minHeight: '100vh',
          },
          '[data-forge-page-transition="true"]': {
            animation: 'forgePageIn 220ms ease',
            transformOrigin: 'top center',
          },
          '::selection': {
            backgroundColor: alpha(tokens.palette.accent.ember, 0.28),
            color: tokens.palette.text.primary,
          },
          '*:focus-visible': {
            outline: `2px solid ${alpha(tokens.palette.accent.gold, 0.9)}`,
            outlineOffset: 2,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
            '[data-forge-page-transition="true"]': {
              animation: 'none',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${tokens.palette.border.subtle}`,
            boxShadow: tokens.shadow.card,
            transition: 'border-color 180ms ease, box-shadow 220ms ease, background-color 220ms ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: tokens.gradients.card,
            boxShadow: tokens.shadow.soft,
            borderColor: tokens.palette.border.subtle,
            transition: 'border-color 180ms ease, box-shadow 220ms ease, transform 220ms ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid ${alpha(tokens.palette.border.strong, 0.72)}`,
            backgroundColor: alpha(tokens.palette.background.elevated, mode === 'dark' ? 0.34 : 0.62),
            fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
            fontSize: '0.66rem',
            fontWeight: 650,
            letterSpacing: '0.005em',
            height: 26,
            transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease',
          },
          icon: {
            marginLeft: 6,
          },
          label: {
            paddingInline: 8,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.control,
            paddingInline: 16,
            minHeight: 40,
            transition:
              'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 180ms ease',
            '&.Mui-focusVisible': {
              boxShadow: `0 0 0 2px ${alpha(focusHalo, 0.92)}, 0 0 0 4px ${alpha(tokens.palette.accent.gold, 0.46)}`,
            },
          },
          containedPrimary: {
            background: tokens.palette.accent.ember,
            color: mode === 'dark' ? '#17110d' : '#fffaf2',
            boxShadow: 'none',
            '&:hover': {
              background: tokens.palette.accent.gold,
              transform: 'translateY(-1px)',
              boxShadow: tokens.shadow.soft,
            },
            '&:active': {
              transform: 'translateY(0) scale(0.99)',
            },
          },
          outlined: {
            borderColor: tokens.palette.border.strong,
            backgroundColor: alpha(tokens.palette.background.elevated, mode === 'dark' ? 0.26 : 0.36),
            '&:hover': {
              borderColor: alpha(tokens.palette.accent.copper, 0.44),
              backgroundColor: alpha(tokens.palette.background.elevated, mode === 'dark' ? 0.52 : 0.72),
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.99)',
            },
          },
          text: {
            color: tokens.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(tokens.palette.background.elevated, mode === 'dark' ? 0.32 : 0.56),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.control,
            transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 180ms ease',
            '&.Mui-focusVisible': {
              boxShadow: `0 0 0 2px ${alpha(focusHalo, 0.92)}, 0 0 0 4px ${alpha(tokens.palette.accent.gold, 0.46)}`,
            },
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.99)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            transition: 'border-color 160ms ease, box-shadow 180ms ease, background-color 180ms ease',
            backgroundColor: alpha(tokens.palette.background.elevated, mode === 'dark' ? 0.18 : 0.46),
            '& .MuiOutlinedInput-notchedOutline': {
              transition: 'border-color 160ms ease, box-shadow 180ms ease',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(tokens.palette.text.secondary, 0.32),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.palette.accent.gold,
              boxShadow: `0 0 0 1px ${alpha(tokens.palette.accent.gold, 0.12)}`,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.panel,
            transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: 10,
          },
          switchBase: {
            transitionDuration: '180ms',
            '&.Mui-checked + .MuiSwitch-track': {
              opacity: 1,
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              boxShadow: `0 0 0 4px ${alpha(tokens.palette.accent.gold, 0.22)}`,
            },
          },
          thumb: {
            boxShadow: 'none',
          },
          track: {
            borderRadius: 999,
            opacity: 1,
            backgroundColor: alpha(tokens.palette.background.elevated, mode === 'dark' ? 0.88 : 0.72),
            border: `1px solid ${alpha(tokens.palette.border.strong, 0.64)}`,
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              outline: `2px solid ${alpha(tokens.palette.accent.gold, 0.9)}`,
              outlineOffset: 2,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: tokens.gradients.panel,
            borderLeft: `1px solid ${tokens.palette.border.strong}`,
          },
        },
      },
    },
  })
}

export const forgeTheme = createForgeTheme('dark')
