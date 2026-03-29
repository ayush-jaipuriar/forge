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
  - formatting future mirrored event metadata without letting screens talk directly to provider APIs
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
- the local Calendar access session is now explicitly bound to the authenticated Firebase user and is cleared on sign-out so another user on the same browser cannot inherit stale Calendar access
- multi-day and overnight events are now duplicated across every constrained date in the cache model so later days do not silently lose pressure coverage

## Current Connection Assumptions

This milestone deliberately keeps the read integration client-bounded.

That means:

- access is granted through a popup using the Firebase-authenticated Google user
- the access token is stored only in local browser state, not in Firestore
- Forge can reconnect and refresh within the local browser context, but it does not yet have a server-managed long-lived Google token system
- write mirroring now exists as an explicit operator-triggered action for major blocks only

Why this is acceptable now:

- the immediate product need is collision pressure and schedule awareness
- introducing a fake “fully durable server-managed Calendar sync” story before long-lived token handling exists would still be misleading

## Current Read Flow

1. User connects Google Calendar from Settings.
2. Forge requests `calendar.readonly` through a dedicated Google popup.
3. Forge stores the user-facing connection snapshot in settings and the short-lived access session locally.
4. Forge fetches external events for the requested date range from the `primary` calendar.
5. Forge normalizes those events into `ExternalCalendarEventCacheRecord` entries.
6. Forge derives `CalendarCollisionSummary` objects by comparing timed Forge blocks against overlapping external events.
7. Today and Schedule surface those summaries as operational pressure, not as a replacement routine source.

## Phase 3 Milestone 8 Write Mirroring

Forge now has a real write-side mirror path layered on top of the read integration.

Current implementation posture:

- Forge can request `https://www.googleapis.com/auth/calendar.events` from the already signed-in Google user
- only major routine blocks are eligible for mirroring
- eligible mirrors must be timed, non-optional, and either required-output, deep-work, or workout blocks
- write mirroring is operator-triggered from Settings through an explicit `Sync major blocks` action
- local mirror mappings are persisted in IndexedDB so reconciliation can update or delete the same Google Calendar events instead of blindly duplicating them
- changed, skipped, moved, or no-longer-eligible blocks are reconciled against existing mirror records
- mirror sync state is tracked separately from external-event read sync state
- local routine changes now mark mirror sync as `stale` when write mirroring is enabled, so the UI does not pretend Calendar is still aligned
- Forge-managed events are ignored by collision analysis when they come back through the read cache, which prevents self-inflicted pressure loops

## Current Limitations

- only the `primary` calendar is supported right now
- Forge does not yet expose multi-calendar selection
- read freshness is local-cache based, not server-orchestrated
- if the local Google Calendar session expires, Forge marks sync state honestly and requires reconnection
- mirror sync is still client-bounded and operator-triggered, not long-lived server-managed reconciliation
- disconnecting Calendar clears local access and read-cache artifacts, but long-lived server-side token management is still future work

## Active Metadata Convention

- event title prefix: `[FORGE] <block title>`
- managed event mode is `majorBlocks` when write mirroring is enabled
- mirrored events carry description metadata with block id, day, block kind, required-output state, and metadata version
- mirrored events use color conventions based on block type so deep work, workout, and prep mirrors stay visually distinct
- Forge-managed events continue to be distinguishable from external events when they round-trip back through the read cache

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
  - `readEnabled`
  - `writeEnabled`

The important design choice is that these states are descriptive, not aspirational. Forge now has live Calendar read and explicit major-block write mirroring, but it still does not pretend a server-managed bidirectional sync system exists.

## How Future Read Flow Should Plug In

1. Extend the current Google Calendar adapter with multi-calendar support only if the product truly needs it.
2. Keep using normalized cached events and collision summaries as the only screen-facing format.
3. Move toward server-assisted refresh only when long-lived OAuth handling is real and honest.
4. Preserve the rule that external events influence pressure without owning routine intent.

## Current Write Flow

1. User enables write mirroring from Settings.
2. Forge requests `calendar.events` through a dedicated Google popup.
3. Forge stores the write-capable local Calendar session and upgrades the connection feature gate to `writeEnabled`.
4. A manual mirror sync evaluates the current local day instances against existing mirror records.
5. Forge creates, updates, or deletes Google Calendar events for major eligible blocks only.
6. Local mirror mappings are updated so later syncs reconcile the same provider event ids.
7. Screens consume connection, mirror, and collision results without issuing provider writes directly.

## Recommendation Boundary

Calendar context is now threaded into the recommendation engine as a typed object rather than a raw string flag. In Phase 1, the placeholder service returns a clear/no-collision context by default, but the top-priority “protect conflict boundary” rule is already wired to respect a constrained calendar context whenever a future adapter starts returning real collisions.

## Why This Matters

The product spec expects future calendar integration to influence schedule pressure and tradeoff suggestions. The domain context should be prepared early even if the API integration lands later.

## Release-Ready Limits

Phase 3 can honestly claim:

- primary-calendar read pressure
- bounded local event caching
- explicit major-block write mirroring with reconciliation
- truthful read and mirror sync-state surfacing in Settings, Today, and Schedule

Phase 3 must not claim:

- long-lived server-managed Google OAuth
- background mirror reconciliation without user action
- multi-calendar selection or organization-level calendar orchestration
- full bidirectional sync ownership over the Forge routine
