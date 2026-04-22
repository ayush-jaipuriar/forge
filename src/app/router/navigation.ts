import type { SvgIconComponent } from '@mui/icons-material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import type { RoutePath } from '@/domain/common/types'

export type NavigationItem = {
  label: string
  path: RoutePath
  icon: SvgIconComponent
}

export const navigationItems: NavigationItem[] = [
  { label: 'Today', path: '/', icon: BoltRoundedIcon },
  { label: 'Plan', path: '/plan', icon: CalendarMonthRoundedIcon },
  { label: 'Insights', path: '/insights', icon: SpaceDashboardRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
]
