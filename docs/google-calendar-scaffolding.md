# Google Calendar Integration Notes

## Phase 1 Boundary

Calendar work in Phase 1 is scaffolding only.

That means:

- define service boundaries
- shape future event metadata
- leave room for collision-aware recommendation inputs
- do not implement full read or write sync yet

## Current Architecture Surface

- typed calendar domain models now exist for:
  - external provider events
  - mirrored Forge routine blocks
  - collision summaries
  - recommendation-facing conflict context
- a placeholder Google Calendar service boundary now exists in code and is responsible for:
  - normalizing connection status
  - returning a recommendation-ready collision context
  - formatting future mirrored event metadata without actually writing events yet
- settings now store a typed `calendarIntegration` snapshot rather than a loose boolean, which gives future integration work a real schema home for provider status, feature gates, and selected calendars
- the recommendation engine now accepts calendar-derived context instead of a generic free-floating conflict flag, so future schedule pressure can come from a real integration seam

## Phase 3 Milestone 7 Read Integration

Forge now has a real Google Calendar read path on top of that original scaffold.

Current implementation posture:

- connection is requested interactively from the already signed-in Google user
- Forge asks only for `https://www.googleapis.com/auth/calendar.readonly`
- the current supported target is the user’s `primary` Google Calendar
- external events are normalized into a bounded local cache for collision analysis
- Today and Schedule now consume collision summaries derived from those cached events
- Settings surfaces connection state, sync state, cache size, and the last sync issue honestly

## Current Connection Assumptions

This milestone deliberately keeps the read integration client-bounded.

That means:

- access is granted through a popup using the Firebase-authenticated Google user
- the access token is stored only in local browser state, not in Firestore
- Forge can reconnect and refresh within the local browser context, but it does not yet have a server-managed long-lived Google token system
- write mirroring is still deferred to the next milestone

Why this is acceptable now:

- the immediate product need is collision pressure and schedule awareness
- introducing a fake “fully durable Calendar sync” story before long-lived token handling exists would be misleading

## Current Read Flow

1. User connects Google Calendar from Settings.
2. Forge requests `calendar.readonly` through a dedicated Google popup.
3. Forge stores the user-facing connection snapshot in settings and the short-lived access session locally.
4. Forge fetches external events for the requested date range from the `primary` calendar.
5. Forge normalizes those events into `ExternalCalendarEventCacheRecord` entries.
6. Forge derives `CalendarCollisionSummary` objects by comparing timed Forge blocks against overlapping external events.
7. Today and Schedule surface those summaries as operational pressure, not as a replacement routine source.

## Current Limitations

- only the `primary` calendar is supported right now
- Forge does not yet expose multi-calendar selection
- read freshness is local-cache based, not server-orchestrated
- if the local Google Calendar session expires, Forge marks sync state honestly and requires reconnection
- Calendar writes and mirror reconciliation are still future work

## Planned Metadata Convention

- event title prefix: `[FORGE] <block title>`
- managed event mode is currently `planned`, not active
- future mirrored event metadata should continue to distinguish Forge-managed events from external events even before bidirectional sync is introduced

## Current Placeholder Status Model

- provider: `google`
- connection status:
  - `notConnected`
  - `scaffoldingReady`
  - `connected`
  - `error`
- feature gate:
  - `scaffoldingOnly`
  - `readMirrorPlanned`
  - `writeMirrorPlanned`

The important design choice is that these states are descriptive, not aspirational. Phase 1 does not pretend live Calendar sync exists.

## How Future Read Flow Should Plug In

1. Extend the current Google Calendar adapter with multi-calendar support only if the product truly needs it.
2. Keep using normalized cached events and collision summaries as the only screen-facing format.
3. Move toward server-assisted refresh only when long-lived OAuth handling is real and honest.
4. Preserve the rule that external events influence pressure without owning routine intent.

## How Future Write Flow Should Plug In

1. Reuse the existing `[FORGE]` event-title convention and managed-event metadata boundary.
2. Generate a typed mirrored-block preview from the routine/day-instance layer before any provider write occurs.
3. Add explicit write-mode and idempotency rules so repeated syncs update the same managed event instead of duplicating entries.
4. Keep provider writes outside the screen layer; screens should only consume typed connection, mirror, and collision results.

## Recommendation Boundary

Calendar context is now threaded into the recommendation engine as a typed object rather than a raw string flag. In Phase 1, the placeholder service returns a clear/no-collision context by default, but the top-priority “protect conflict boundary” rule is already wired to respect a constrained calendar context whenever a future adapter starts returning real collisions.

## Why This Matters

The product spec expects future calendar integration to influence schedule pressure and tradeoff suggestions. The domain context should be prepared early even if the API integration lands later.
