export type DayMode = 'ideal' | 'normal' | 'lowEnergy' | 'survival'

export type WarState = 'dominant' | 'onTrack' | 'slipping' | 'critical'

export type RoutePath =
  | '/'
  | '/schedule'
  | '/prep'
  | '/physical'
  | '/readiness'
  | '/settings'

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type DayType =
  | 'wfhHighOutput'
  | 'wfoContinuity'
  | 'weekendDeepWork'
  | 'weekendConsolidation'
  | 'lowEnergy'
  | 'survival'

export type BlockKind =
  | 'activation'
  | 'deepWork'
  | 'prep'
  | 'review'
  | 'workout'
  | 'planning'
  | 'recovery'
  | 'analytics'

export type BlockStatus = 'planned' | 'completed' | 'skipped' | 'moved'

export type WorkoutStatus = 'scheduled' | 'done' | 'skipped' | 'rescheduled' | 'optional'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export type PrepExposureState = 'notStarted' | 'introduced' | 'inProgress' | 'retention' | 'confident'

export type ReadinessLevel = 'critical' | 'behind' | 'building' | 'onTrack'

export type SyncStatus = 'stable' | 'syncing' | 'queued'
