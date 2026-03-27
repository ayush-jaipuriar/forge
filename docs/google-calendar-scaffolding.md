# Google Calendar Scaffolding

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

1. Add a real Google Calendar adapter behind the existing calendar service boundary.
2. Resolve selected calendars from `settings.calendarIntegration.selectedCalendarIds`.
3. Fetch external events for the requested date range.
4. Convert them into typed `ExternalCalendarEvent` records.
5. Build a `CalendarCollisionSummary` from those events and the seeded/generated Forge blocks.
6. Feed that summary into the existing recommendation calendar-context mapping so Today and Schedule can react without UI rewrites.

## How Future Write Flow Should Plug In

1. Reuse the existing `[FORGE]` event-title convention and managed-event metadata boundary.
2. Generate a typed mirrored-block preview from the routine/day-instance layer before any provider write occurs.
3. Add explicit write-mode and idempotency rules so repeated syncs update the same managed event instead of duplicating entries.
4. Keep provider writes outside the screen layer; screens should only consume typed connection, mirror, and collision results.

## Recommendation Boundary

Calendar context is now threaded into the recommendation engine as a typed object rather than a raw string flag. In Phase 1, the placeholder service returns a clear/no-collision context by default, but the top-priority “protect conflict boundary” rule is already wired to respect a constrained calendar context whenever a future adapter starts returning real collisions.

## Why This Matters

The product spec expects future calendar integration to influence schedule pressure and tradeoff suggestions. The domain context should be prepared early even if the API integration lands later.
