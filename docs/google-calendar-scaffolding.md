# Google Calendar Scaffolding

## Phase 1 Boundary

Calendar work in Phase 1 is scaffolding only.

That means:

- define service boundaries
- shape future event metadata
- leave room for collision-aware recommendation inputs
- do not implement full read or write sync yet

## Planned Metadata Convention

- event prefix: `[FORGE] <block title>`

## Why This Matters

The product spec expects future calendar integration to influence schedule pressure and tradeoff suggestions. The domain context should be prepared early even if the API integration lands later.
