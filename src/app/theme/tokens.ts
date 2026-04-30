export type ForgeThemeMode = 'dark' | 'light'

const sharedRadius = {
  control: 10,
  card: 16,
  hero: 22,
  panel: 12,
  pill: 999,
} as const

export const forgeThemeTokens = {
  dark: {
    palette: {
      background: {
        default: '#12100d',
        canvas: '#12100d',
        surface: '#191612',
        paper: '#1f1a15',
        panel: '#261f18',
        elevated: '#30271f',
        shell: '#181410',
        nav: '#15110e',
      },
      text: {
        primary: '#fbf4e9',
        secondary: '#d5c7b6',
        muted: '#9d8f7e',
      },
      accent: {
        ember: '#c86f42',
        gold: '#e4a968',
        copper: '#a97653',
        steel: '#7f8a8a',
        critical: '#c85f59',
        success: '#6f967d',
        warning: '#bf8c4c',
      },
      border: {
        subtle: 'rgba(251, 244, 233, 0.09)',
        strong: 'rgba(251, 244, 233, 0.16)',
        accent: 'rgba(200, 111, 66, 0.32)',
      },
    },
    gradients: {
      page:
        'radial-gradient(circle at top left, rgba(200, 111, 66, 0.12), transparent 30%), radial-gradient(circle at 80% 12%, rgba(228, 169, 104, 0.06), transparent 26%), linear-gradient(180deg, #17130f 0%, #12100d 100%)',
      card: 'linear-gradient(180deg, rgba(36, 30, 23, 0.96) 0%, rgba(25, 21, 17, 0.98) 100%)',
      panel: 'linear-gradient(180deg, rgba(38, 31, 24, 0.96) 0%, rgba(24, 20, 16, 1) 100%)',
      hero:
        'radial-gradient(circle at top right, rgba(228, 169, 104, 0.12), transparent 34%), linear-gradient(180deg, rgba(38, 31, 24, 0.98) 0%, rgba(22, 18, 15, 0.98) 100%)',
      quiet:
        'linear-gradient(180deg, rgba(31, 26, 21, 0.74) 0%, rgba(24, 20, 16, 0.72) 100%)',
    },
    shadow: {
      card: '0 16px 42px rgba(10, 7, 5, 0.24)',
      glow: '0 0 0 1px rgba(228, 169, 104, 0.08), 0 24px 54px rgba(10, 7, 5, 0.28)',
      soft: '0 10px 30px rgba(10, 7, 5, 0.2)',
    },
    radius: sharedRadius,
  },
  light: {
    palette: {
      background: {
        default: '#f7f2ea',
        canvas: '#f7f2ea',
        surface: '#fbf7f0',
        paper: '#fffaf2',
        panel: '#f1e7d9',
        elevated: '#ffffff',
        shell: '#fff8ee',
        nav: '#f4eadc',
      },
      text: {
        primary: '#28231d',
        secondary: '#675b4d',
        muted: '#958675',
      },
      accent: {
        ember: '#b8663d',
        gold: '#926837',
        copper: '#815c3f',
        steel: '#6c7770',
        critical: '#a64e47',
        success: '#517b61',
        warning: '#9a713d',
      },
      border: {
        subtle: 'rgba(72, 58, 43, 0.11)',
        strong: 'rgba(72, 58, 43, 0.18)',
        accent: 'rgba(184, 102, 61, 0.28)',
      },
    },
    gradients: {
      page:
        'radial-gradient(circle at top left, rgba(184, 102, 61, 0.1), transparent 28%), radial-gradient(circle at 84% 4%, rgba(146, 104, 55, 0.08), transparent 26%), linear-gradient(180deg, #fff8ef 0%, #f7f2ea 100%)',
      card: 'linear-gradient(180deg, rgba(255, 250, 242, 0.98) 0%, rgba(250, 244, 235, 0.98) 100%)',
      panel: 'linear-gradient(180deg, rgba(255, 250, 242, 0.98) 0%, rgba(244, 234, 220, 1) 100%)',
      hero:
        'radial-gradient(circle at top right, rgba(184, 102, 61, 0.12), transparent 32%), linear-gradient(180deg, rgba(255, 250, 242, 0.98) 0%, rgba(243, 232, 217, 0.98) 100%)',
      quiet:
        'linear-gradient(180deg, rgba(255, 250, 242, 0.64) 0%, rgba(247, 242, 234, 0.72) 100%)',
    },
    shadow: {
      card: '0 14px 36px rgba(75, 55, 34, 0.08)',
      glow: '0 0 0 1px rgba(184, 102, 61, 0.08), 0 18px 44px rgba(75, 55, 34, 0.1)',
      soft: '0 8px 24px rgba(75, 55, 34, 0.07)',
    },
    radius: sharedRadius,
  },
} as const

export function getForgeTokens(mode: ForgeThemeMode) {
  return forgeThemeTokens[mode]
}

export const forgeTokens = forgeThemeTokens.dark
