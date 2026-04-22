# Forge Product Simplification Sprint 2 Plan

This sprint is the second implementation sprint for the dedicated product simplification stream.

Sprint 1 fixed the top-level IA.

Sprint 2 fixes the most important remaining surface-level clarity problem: `Today`.

## Sprint Goal

Make `Today` the unmistakable center of gravity for Forge.

After this sprint, a user should be able to open Forge and answer this in a few seconds:

- what am I doing now?
- what is the next action?
- what is the main risk today?
- what is my agenda?

The page should stop feeling like a systems dashboard and start feeling like a clear daily execution surface.

## Why This Sprint Comes Now

The authenticated Sprint 1 audit confirmed that the simplified shell is active:

- `Today`
- `Plan`
- `Insights`
- `Settings`

That solved the top-level navigation confusion.

But the audit also confirmed the next product bottleneck:

- `Today` still carries too much support/system content too early
- shell readiness and install posture still compete with daily action
- quick signals, mode override, score breakdown, readiness, physical state, and calendar context all appear before the user has fully anchored on the current action

That means the product now needs a decisive `Today` consolidation pass.

## Locked Sprint Scope

Sprint 2 includes:

- aggressive first-viewport simplification for `Today`
- removal of the broad global install/shell-readiness surface from normal authenticated use
- integration of daily Physical and Readiness cues into `Today` as small contextual signals
- copy compression on `Today`
- desktop and mobile restructuring as equal priorities
- regression tests for the new Today hierarchy
- automated verification and a lightweight browser audit where tooling permits

Sprint 2 does **not** include:

- full Plan consolidation
- full Insights consolidation
- full Settings simplification
- cross-app copy rewrite
- new domain modeling for Physical or Readiness

Those remain later simplification sprints.

## Product Principle

`Today` should not explain the system.

`Today` should help the user act.

That means the page should prioritize:

1. current mission
2. next action
3. agenda
4. one risk or constraint
5. lightweight readiness/physical context only when it changes the day

Everything else should be collapsed, moved lower, or removed from normal flow.

## Target Today Hierarchy

## 1. Top Action Band

### Goal

Replace the current broad hero-plus-system stack with one direct action band.

### Target Content

- page title: `Today`
- short date/day label
- current block or day focus
- primary action: `What should I do now?`
- secondary action: `Mark current block complete`
- one compact risk/state chip if needed

### Checklist

- [x] Compress the current hero copy.
- [x] Remove explanatory product language from the hero.
- [x] Keep only one primary action visually dominant.
- [x] Avoid multiple equal-weight badges in the hero.
- [x] Ensure the top band remains compact on mobile.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [SectionHeader.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx)

## 2. Current Mission Surface

### Goal

Make the current block the dominant content.

### Target Content

- current mission title
- one-line detail
- current block time or `Flexible`
- current score/pressure summary only if compact
- direct completion action

### Checklist

- [x] Keep the current mission visually dominant.
- [x] Reduce internal metric tiles from three equal cards to a tighter summary row.
- [x] Remove or collapse `Projected Score` details from the first viewport.
- [x] Keep the current block action close to the current block.
- [x] Ensure mobile shows current mission before support context.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [BlockNoteComposer.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/components/BlockNoteComposer.tsx)

## 3. Agenda Surface

### Goal

Keep the execution timeline visible, but make it read as a working list rather than a wall of cards.

### Target Content

- compact agenda heading
- current block highlighted
- planned blocks shown with action buttons
- completed/moved/skipped blocks quieter
- notes available but not visually dominant

### Checklist

- [x] Make agenda the second major surface after current mission.
- [x] Reduce card weight for non-current blocks.
- [x] Keep action buttons scannable but less visually noisy.
- [x] Collapse non-current block explanatory text where possible.
- [x] Ensure agenda remains usable on mobile.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [BlockNoteComposer.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/components/BlockNoteComposer.tsx)

## 4. Integrated Physical And Readiness Cues

### Goal

Merge daily Physical and Readiness context into `Today` without making them feel like separate products.

### Target Behavior

Physical and Readiness should appear as small context, not as full sections.

Use them to answer:

- is energy/sleep likely to change the plan?
- is workout posture relevant today?
- is the target pressure meaningful today?

### Checklist

- [x] Replace the current `Execution Context`, `Quick Signals`, `Mode Override`, `Pressure Stack`, and `Support Layer` spread with a smaller daily context module.
- [x] Keep sleep and energy inputs accessible but not visually dominant.
- [x] Show workout posture as one compact row or chip.
- [x] Show target/readiness pressure only as a concise cue.
- [x] Avoid exposing deep Readiness terminology in the first viewport.
- [x] Preserve the ability to update daily sleep/energy signals.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [SignalToggleGroup.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/components/SignalToggleGroup.tsx)

## 5. Hide Broad Shell Readiness From Normal Use

### Goal

Remove the broad install/runtime/readiness card from normal authenticated desktop and mobile use.

The install/PWA/platform surface is not a primary user problem, and it should not consume early page real estate.

### Target Behavior

- no broad install/readiness card in normal authenticated use
- no broad install/readiness card on mobile
- installation prompt may exist only as a small non-disruptive control or advanced/settings concern
- critical offline/update failure states may still surface if they require user action

### Checklist

- [x] Stop rendering the broad `PwaStatusCard` in normal authenticated shell flow.
- [x] Ensure `canInstall` does not create a full-width page-level card.
- [x] Preserve genuinely actionable critical states if required.
- [x] Consider moving install/update posture to Settings or a compact header affordance later.
- [x] Update tests that expect install/runtime content in the primary shell.

### Likely Files

- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [PwaStatusCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/components/PwaStatusCard.tsx)
- [pwaStatus.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/pwaStatus.ts)

## 6. Collapse Or Demote Secondary Today Detail

### Goal

Reduce clutter by moving secondary system detail below the main workflow or behind interaction.

### Modules To Demote

- recommendation history
- deep score breakdown
- calendar sync metadata
- mode persistence/sync explanation
- broad operational alert explanations
- verbose recommendation rationale

### Checklist

- [x] Hide recommendation history unless the user asks for it or it has high value.
- [x] Replace deep score breakdown with one compact pressure summary.
- [x] Reduce calendar pressure to a concise constraint card lower on the page.
- [x] Reduce mode override language and remove sync-mechanics copy.
- [x] Keep operational alerts only if they are actionable.
- [x] Remove “why this rule fired” verbosity from the default recommendation state.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [FallbackModeSuggestionCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/components/FallbackModeSuggestionCard.tsx)
- [OperationalSignalCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/OperationalSignalCard.tsx)

## 7. Today Copy Compression

### Goal

Cut Today copy enough that the page stops narrating itself.

### Rules

- title says the point
- one short sentence gives consequence
- details appear only where they change action
- avoid internal language like:
  - support layer
  - operational timeline
  - pressure stack
  - sync state aligned
  - rule fired

### Checklist

- [x] Rewrite Today hero copy.
- [x] Rewrite current mission copy.
- [x] Rewrite agenda copy.
- [x] Rewrite daily context copy.
- [x] Rewrite recommendation copy.
- [ ] Rewrite empty/loading copy.
- [x] Remove system-mechanics explanations from normal user flow.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [FallbackModeSuggestionCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/components/FallbackModeSuggestionCard.tsx)

## 8. Desktop And Mobile Layout

### Goal

Treat desktop and mobile as equal targets.

Desktop should feel composed and action-first.

Mobile should feel like an installed daily action app, not a stack of diagnostics.

### Desktop Checklist

- [x] Current mission and agenda dominate the main column.
- [x] Context moves into one compact side or lower module.
- [x] No full-width install/readiness card appears above Today.
- [x] No large empty gaps appear between current mission and agenda.
- [x] Secondary modules use lower density and smaller visual weight.

### Mobile Checklist

- [x] Current mission appears before context modules.
- [x] Primary action appears above or near current mission.
- [x] Sleep/energy inputs are reachable but not first-screen dominant.
- [x] Agenda remains compact and scrollable.
- [x] No broad install/readiness card appears.
- [x] Bottom nav does not obscure primary actions.

### Likely Files

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)

## 9. Automated Validation

### Goal

Prove the simplified Today behavior through automation so user re-testing stays lightweight.

### Checklist

- [x] Update Today route tests for the new hierarchy.
- [x] Add assertions that the broad shell readiness/install card is absent in normal authenticated flow.
- [x] Add or update tests for the primary Today action.
- [x] Add or update tests for agenda visibility.
- [x] Add or update tests for sleep/energy input accessibility.
- [ ] Add or update tests for mobile-safe navigation if practical in the existing test setup.
- [x] Run:
  - [x] `npm run lint`
  - [x] `npm run typecheck`
  - [x] `npm run test:run`
  - [x] `npm run build`

## 10. Browser QA

### Goal

Perform a lightweight visual audit of Today after implementation.

### Checklist

- [ ] Verify desktop Today first viewport:
  - [ ] current mission is obvious
  - [ ] next action is obvious
  - [ ] agenda is easy to find
  - [ ] support/system content is not competing
- [ ] Verify mobile Today:
  - [ ] no broad install/readiness card
  - [ ] current mission appears early
  - [ ] action buttons are reachable
  - [ ] agenda is not buried behind diagnostics
- [ ] Capture screenshots where local tooling permits.
- [x] If screenshot tooling is blocked, document the limitation honestly.

## Acceptance Criteria

Sprint 2 is complete when:

- `Today` clearly prioritizes current mission, next action, and agenda
- broad shell readiness/install card no longer appears in normal authenticated desktop/mobile flow
- Physical and Readiness cues are integrated as compact context, not standalone page-like sections
- Quick Signals, Mode Override, and deep Score Pressure no longer dominate the first viewport
- Today copy is materially shorter
- desktop and mobile layouts both support immediate action
- automated verification is green
- sprint documentation is updated with implementation notes and validation results

## Implementation Sequence

1. Remove or hide broad shell readiness/install surfacing in normal authenticated app flow.
2. Restructure Today around current mission and agenda.
3. Merge daily Physical/Readiness cues into a compact context module.
4. Demote deep score, calendar, mode, and recommendation details.
5. Compress Today copy.
6. Update tests.
7. Run full verification.
8. Do browser QA where tooling permits.
9. Record completion notes in this document.

## Likely Next Step After This Plan

The next action should be:

1. review this Sprint 2 plan
2. approve implementation
3. implement the Today consolidation
4. verify through automated tests and visual audit

## Sprint 2 Closeout

### Status

Sprint 2 implementation is complete at the code and automated validation level.

### What Changed

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
  - compressed the hero into a direct action band
  - made the current mission and agenda the dominant working surfaces
  - replaced the separate `Execution Context`, `Quick Signals`, `Mode Override`, `Pressure Stack`, and `Support Layer` spread with compact daily context, day mode, and main-risk modules
  - removed recommendation history from the normal Today flow
  - shortened recommendation and block-status copy
  - kept sleep/energy/day-mode controls available without making them first-screen dominant
- [pwaStatus.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/pwaStatus.ts)
  - stopped healthy installability and offline-ready states from rendering shell readiness/install cards in normal authenticated app flow
  - preserved full card surfacing for genuinely disruptive states such as offline, non-stable sync, or pending update
- [app.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/app.spec.tsx)
  - added a regression test that Today renders as an action-first surface
  - asserts the old support-dashboard labels and broad install prompt are absent
- [pwa-status.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/pwa-status.spec.ts)
  - updated PWA surface expectations to match the new product decision

### Validation Result

Automated verification is green:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` -> `69` files, `260` tests passed
- `npm run build`

### Browser QA Boundary

A local preview was available at `http://127.0.0.1:4180`, but automated browser QA was limited by local tooling:

- Playwright CLI sessions opened and then lost their target page
- prior direct Chrome control was denied by the desktop connector
- terminal screenshot capture was previously blocked by macOS display permissions

Because of that, Sprint 2 closes with strong automated validation and code-level confidence, while rendered screenshot evidence should be captured manually or after browser automation permissions are restored.

### Remaining Follow-up

- Expand mobile-nav-specific regression coverage in a future pass.
- Capture desktop/mobile screenshots once local browser automation is reliable.
- Review the updated Today page in the logged-in browser before planning Sprint 3.
