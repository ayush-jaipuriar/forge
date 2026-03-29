import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import type { CalendarSessionSnapshot, ExternalCalendarEventCacheRecord } from '@/domain/calendar/types'

export const GOOGLE_CALENDAR_READ_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly' as const

type GoogleCalendarApiEvent = {
  id: string
  summary?: string
  location?: string
  start?: {
    date?: string
    dateTime?: string
  }
  end?: {
    date?: string
    dateTime?: string
  }
}

type GoogleCalendarEventsResponse = {
  items?: GoogleCalendarApiEvent[]
  nextPageToken?: string
}

export async function requestGoogleCalendarSession(): Promise<CalendarSessionSnapshot> {
  const auth = getFirebaseAuth()
  const user = auth?.currentUser

  if (!auth || !user) {
    throw new Error('Sign in with Google before connecting Calendar.')
  }

  const provider = new GoogleAuthProvider()
  provider.addScope(GOOGLE_CALENDAR_READ_SCOPE)
  provider.setCustomParameters({
    prompt: 'consent',
  })

  const credential = await reauthenticateWithPopup(user, provider)
  const token = GoogleAuthProvider.credentialFromResult(credential)?.accessToken

  if (!token) {
    throw new Error('Google Calendar access token was not returned by the provider.')
  }

  return {
    id: 'default',
    provider: 'google',
    accessScope: GOOGLE_CALENDAR_READ_SCOPE,
    accessToken: token,
    grantedAt: new Date().toISOString(),
  }
}

export async function fetchGoogleCalendarEvents(args: {
  accessToken: string
  startDate: string
  endDate: string
  calendarId?: string
}): Promise<ExternalCalendarEventCacheRecord[]> {
  const calendarId = encodeURIComponent(args.calendarId ?? 'primary')
  const timeMin = new Date(`${args.startDate}T00:00:00`).toISOString()
  const timeMax = new Date(`${args.endDate}T23:59:59`).toISOString()
  const collected: ExternalCalendarEventCacheRecord[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`)
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('timeMin', timeMin)
    url.searchParams.set('timeMax', timeMax)
    url.searchParams.set('maxResults', '250')

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Google Calendar request failed with ${response.status}.`)
    }

    const payload = (await response.json()) as GoogleCalendarEventsResponse
    const fetchedAt = new Date().toISOString()

    collected.push(
      ...(payload.items ?? [])
        .map((event) => normalizeGoogleCalendarEventForCache(event, fetchedAt))
        .filter((event): event is ExternalCalendarEventCacheRecord => event !== null),
    )

    pageToken = payload.nextPageToken
  } while (pageToken)

  return collected
}

export function normalizeGoogleCalendarEventForCache(
  event: GoogleCalendarApiEvent,
  fetchedAt: string,
): ExternalCalendarEventCacheRecord | null {
  const startsAt = event.start?.dateTime ?? (event.start?.date ? `${event.start.date}T00:00:00.000Z` : null)
  const endsAt = event.end?.dateTime ?? (event.end?.date ? `${event.end.date}T00:00:00.000Z` : null)

  if (!startsAt || !endsAt) {
    return null
  }

  const allDay = !event.start?.dateTime

  return {
    id: `google:${event.id}`,
    provider: 'google',
    calendarId: 'primary',
    providerEventId: event.id,
    title: event.summary?.trim() || 'Untitled event',
    startsAt,
    endsAt,
    allDay,
    location: event.location,
    isForgeManaged: (event.summary ?? '').startsWith('[FORGE]'),
    date: startsAt.slice(0, 10),
    fetchedAt,
  }
}
