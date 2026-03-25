import type { SvgIconComponent } from '@mui/icons-material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import type { RoutePath } from '@/domain/common/types'

export type NavigationItem = {
  label: string
  path: RoutePath
  icon: SvgIconComponent
}

export const navigationItems: NavigationItem[] = [
  { label: 'Today', path: '/', icon: BoltRoundedIcon },
  { label: 'Schedule', path: '/schedule', icon: CalendarMonthRoundedIcon },
  { label: 'Prep', path: '/prep', icon: SchoolRoundedIcon },
  { label: 'Physical', path: '/physical', icon: FitnessCenterRoundedIcon },
  { label: 'Readiness', path: '/readiness', icon: QueryStatsRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
]
