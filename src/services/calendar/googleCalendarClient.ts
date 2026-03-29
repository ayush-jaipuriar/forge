import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import type { CalendarAccessScope, CalendarSessionSnapshot, ExternalCalendarEventCacheRecord } from '@/domain/calendar/types'

export const GOOGLE_CALENDAR_READ_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly' as const
export const GOOGLE_CALENDAR_WRITE_SCOPE = 'https://www.googleapis.com/auth/calendar.events' as const

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

type GoogleCalendarWritableEventInput = {
  title: string
  description: string
  startsAt: string
  endsAt: string
  colorId?: string
}

type GoogleCalendarWriteResponse = {
  id?: string
}

export async function requestGoogleCalendarSession(
  accessScope: CalendarAccessScope = GOOGLE_CALENDAR_READ_SCOPE,
): Promise<CalendarSessionSnapshot> {
  const auth = getFirebaseAuth()
  const user = auth?.currentUser

  if (!auth || !user) {
    throw new Error('Sign in with Google before connecting Calendar.')
  }

  const provider = new GoogleAuthProvider()
  provider.addScope(accessScope)
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
    userId: user.uid,
    provider: 'google',
    accessScope,
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
  const rawCalendarId = args.calendarId ?? 'primary'
  const calendarId = encodeURIComponent(rawCalendarId)
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
        .flatMap((event) => normalizeGoogleCalendarEventForCache(event, fetchedAt, rawCalendarId))
        .filter((event): event is ExternalCalendarEventCacheRecord => event !== null),
    )

    pageToken = payload.nextPageToken
  } while (pageToken)

  return collected
}

export function normalizeGoogleCalendarEventForCache(
  event: GoogleCalendarApiEvent,
  fetchedAt: string,
  calendarId = 'primary',
): ExternalCalendarEventCacheRecord[] {
  const startsAt = event.start?.dateTime ?? (event.start?.date ? `${event.start.date}T00:00:00.000Z` : null)
  const endsAt = event.end?.dateTime ?? (event.end?.date ? `${event.end.date}T00:00:00.000Z` : null)

  if (!startsAt || !endsAt) {
    return []
  }

  const allDay = !event.start?.dateTime
  const coveredDates = getCoveredDates(startsAt, endsAt, allDay)

  return coveredDates.map((date) => ({
    id: `google:${event.id}:${date}`,
    provider: 'google',
    calendarId,
    providerEventId: event.id,
    title: event.summary?.trim() || 'Untitled event',
    startsAt,
    endsAt,
    allDay,
    location: event.location,
    isForgeManaged: (event.summary ?? '').startsWith('[FORGE]'),
    date,
    fetchedAt,
  }))
}

function getCoveredDates(startsAt: string, endsAt: string, allDay: boolean) {
  const start = new Date(startsAt)
  const exclusiveEnd = new Date(endsAt)
  const inclusiveEnd = allDay
    ? new Date(exclusiveEnd.getTime() - 1000)
    : exclusiveEnd
  const dates: string[] = []
  const cursor = new Date(start)

  while (cursor <= inclusiveEnd) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    cursor.setUTCHours(0, 0, 0, 0)
  }

  return [...new Set(dates)]
}

export async function createGoogleCalendarEvent(args: {
  accessToken: string
  calendarId?: string
  event: GoogleCalendarWritableEventInput
}) {
  const payload = await requestGoogleCalendarWrite({
    accessToken: args.accessToken,
    calendarId: args.calendarId,
    method: 'POST',
    event: args.event,
  })

  if (!payload.id) {
    throw new Error('Google Calendar did not return an event id for the new mirror.')
  }

  return {
    providerEventId: payload.id,
  }
}

export async function updateGoogleCalendarEvent(args: {
  accessToken: string
  calendarId?: string
  providerEventId: string
  event: GoogleCalendarWritableEventInput
}) {
  const payload = await requestGoogleCalendarWrite({
    accessToken: args.accessToken,
    calendarId: args.calendarId,
    providerEventId: args.providerEventId,
    method: 'PUT',
    event: args.event,
  })

  if (!payload.id) {
    throw new Error('Google Calendar did not return an event id for the updated mirror.')
  }

  return {
    providerEventId: payload.id,
  }
}

export async function deleteGoogleCalendarEvent(args: {
  accessToken: string
  calendarId?: string
  providerEventId: string
}) {
  const rawCalendarId = args.calendarId ?? 'primary'
  const calendarId = encodeURIComponent(rawCalendarId)
  const providerEventId = encodeURIComponent(args.providerEventId)
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${providerEventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    },
  )

  if (response.status === 404) {
    return {
      deleted: true,
      missing: true,
    }
  }

  if (!response.ok) {
    throw new Error(`Google Calendar delete failed with ${response.status}.`)
  }

  return {
    deleted: true,
    missing: false,
  }
}

async function requestGoogleCalendarWrite(args: {
  accessToken: string
  calendarId?: string
  providerEventId?: string
  method: 'POST' | 'PUT'
  event: GoogleCalendarWritableEventInput
}) {
  const rawCalendarId = args.calendarId ?? 'primary'
  const calendarId = encodeURIComponent(rawCalendarId)
  const eventPath = args.providerEventId ? `/events/${encodeURIComponent(args.providerEventId)}` : '/events'
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}${eventPath}`, {
    method: args.method,
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: args.event.title,
      description: args.event.description,
      start: {
        dateTime: args.event.startsAt,
      },
      end: {
        dateTime: args.event.endsAt,
      },
      colorId: args.event.colorId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Google Calendar write failed with ${response.status}.`)
  }

  return (await response.json()) as GoogleCalendarWriteResponse
}
