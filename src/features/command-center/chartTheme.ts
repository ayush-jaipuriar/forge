import { alpha } from '@mui/material/styles'
import { forgeTokens } from '@/app/theme/tokens'

export type CommandCenterTone = 'ember' | 'gold' | 'steel' | 'success' | 'critical'

export const commandCenterChartTheme = {
  tones: {
    ember: {
      solid: forgeTokens.palette.accent.ember,
      soft: alpha(forgeTokens.palette.accent.ember, 0.18),
      border: alpha(forgeTokens.palette.accent.ember, 0.4),
    },
    gold: {
      solid: forgeTokens.palette.accent.gold,
      soft: alpha(forgeTokens.palette.accent.gold, 0.18),
      border: alpha(forgeTokens.palette.accent.gold, 0.42),
    },
    steel: {
      solid: forgeTokens.palette.accent.steel,
      soft: alpha(forgeTokens.palette.accent.steel, 0.18),
      border: alpha(forgeTokens.palette.accent.steel, 0.4),
    },
    success: {
      solid: forgeTokens.palette.accent.success,
      soft: alpha(forgeTokens.palette.accent.success, 0.18),
      border: alpha(forgeTokens.palette.accent.success, 0.42),
    },
    critical: {
      solid: forgeTokens.palette.accent.critical,
      soft: alpha(forgeTokens.palette.accent.critical, 0.18),
      border: alpha(forgeTokens.palette.accent.critical, 0.42),
    },
  },
  gridLine: alpha(forgeTokens.palette.text.secondary, 0.18),
  label: forgeTokens.palette.text.secondary,
} as const
