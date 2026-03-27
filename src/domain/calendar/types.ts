export type CalendarProvider = 'google'

export type CalendarConnectionStatus = 'notConnected' | 'scaffoldingReady' | 'connected' | 'error'

export type CalendarFeatureGate = 'scaffoldingOnly' | 'readMirrorPlanned' | 'writeMirrorPlanned'

export type CalendarManagedEventMode = 'disabled' | 'planned'

export type CalendarConnectionSnapshot = {
  provider: CalendarProvider
  connectionStatus: CalendarConnectionStatus
  featureGate: CalendarFeatureGate
  managedEventMode: CalendarManagedEventMode
  selectedCalendarIds: string[]
  lastConnectionCheckAt?: string
  lastSuccessfulSyncAt?: string
}

export type ExternalCalendarEvent = {
  id: string
  provider: CalendarProvider
  calendarId: string
  providerEventId: string
  title: string
  startsAt: string
  endsAt: string
  allDay: boolean
  location?: string
  isForgeManaged: boolean
}

export type MirroredRoutineBlock = {
  blockId: string
  dayDate: string
  title: string
  eventTitle: string
  startsAt?: string
  endsAt?: string
  writeMode: CalendarManagedEventMode
}

export type CalendarCollisionSeverity = 'none' | 'soft' | 'hard'

export type CalendarCollisionWindow = {
  startsAt: string
  endsAt: string
  reason: string
  eventIds: string[]
}

export type CalendarCollisionSummary = {
  date: string
  severity: CalendarCollisionSeverity
  overlappingEventCount: number
  constrainedWindows: CalendarCollisionWindow[]
  mirroredBlockCount: number
  source: 'placeholder' | 'liveMirror'
}

export type CalendarRecommendationContext = {
  conflictState: 'clear' | 'constrained'
  provider: CalendarProvider
  connectionStatus: CalendarConnectionStatus
  featureGate: CalendarFeatureGate
  summary: CalendarCollisionSummary
}

export function createDefaultCalendarConnectionSnapshot(): CalendarConnectionSnapshot {
  return {
    provider: 'google',
    connectionStatus: 'notConnected',
    featureGate: 'scaffoldingOnly',
    managedEventMode: 'disabled',
    selectedCalendarIds: [],
  }
}

export function createEmptyCalendarCollisionSummary(date: string): CalendarCollisionSummary {
  return {
    date,
    severity: 'none',
    overlappingEventCount: 0,
    constrainedWindows: [],
    mirroredBlockCount: 0,
    source: 'placeholder',
  }
}
