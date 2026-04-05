# About Page Implementation Plan

## Goal

Add a new first-class `About` page to Forge that appears alongside the existing app sections on both desktop and mobile.

The page should:

- live inside the main authenticated app shell
- be visible to both Google-authenticated users and guest-session users
- explain briefly why Forge exists
- introduce the developer with name and role
- link to:
  - LinkedIn: `https://www.linkedin.com/in/ayush-jaipuriar/`
  - Portfolio: `https://ayush-jaipuriar.github.io/Personal-Portfolio/about`
- end with a polished footer line based on:
  - `Made with love by Ayush Jaipuriar`

## Confirmed Content Direction

- Page title: `About`
- Navigation presence:
  - desktop left rail: yes
  - mobile nav/menu: yes
- Content style:
  - minimal
  - short `why Forge exists` block
  - separate short `about the developer` block
- Developer line:
  - `Ayush Jaipuriar`
  - `Developer at TransUnion`
- External links:
  - visible on the page
  - open in a new tab
- Footer:
  - polished variant of `Made with love by Ayush Jaipuriar`

## Why This Shape

This should be implemented as a real app section, not a footer link or auth-screen add-on.

That is the right choice because:

- it fits the existing Forge shell model
- it stays available after both sign-in paths
- it makes the project story discoverable without mixing it into operational screens like `Settings`
- it keeps the content lightweight and intentional instead of scattering personal/project context across the app

## Existing Integration Points

The current codebase already gives us the core structure we need:

- shared route tree: `src/app/router/AppRouter.tsx`
- shared nav config: `src/app/router/navigation.ts`
- route-path typing: `src/domain/common/types.ts`
- shared shell rendering across authenticated and guest sessions: `src/components/layout/AppShell.tsx`

Because guest sessions already pass through the same protected shell, the new page should automatically be visible to both:

- `authenticated`
- `guest`

No separate auth gating should be added for this feature.

## Planned Files

Expected primary files:

- `src/domain/common/types.ts`
- `src/app/router/navigation.ts`
- `src/app/router/AppRouter.tsx`
- `src/features/about/pages/AboutPage.tsx`

Likely test/documentation files:

- `src/tests/app.spec.tsx`
- new page-specific test, likely:
  - `src/tests/about-page.spec.tsx`
- `README.md`

Optional shared primitives if needed:

- existing section/header/card primitives under `src/components/common/`

## Content Structure

The page should stay concise and feel consistent with the modernized Forge surfaces.

Recommended structure:

1. Hero / intro
- eyebrow: `About`
- title: short, direct, product-centered
- brief explanation of Forge as a personal execution OS built for disciplined execution

2. Why Forge exists
- one short paragraph
- focus on the product problem Forge is trying to solve
- no overly long manifesto copy

3. About the developer
- `Ayush Jaipuriar`
- `Developer at TransUnion`
- short sentence about building Forge

4. External links
- LinkedIn
- Portfolio
- open in new tab
- marked clearly as external links

5. Footer line
- polished variation of:
  - `Made with love by Ayush Jaipuriar`

## Visual Direction

The page should feel like part of the current Forge UI system, not like a separate landing page.

That means:

- same shell and nav behavior as other pages
- same dark / amber palette
- same restrained panel language
- strong hierarchy, but not a heavy dashboard layout
- content-centered rather than metric-centered

The design should read more like:

- a calm project note
- a product origin surface

and less like:

- a marketing splash page
- a resume page
- a dense settings-style operator screen

## Workstreams

### 1. Route and Type Integration

Add the new route path everywhere the app expects strongly typed route membership.

Checklist:

- [x] Add `/about` to `RoutePath` in `src/domain/common/types.ts`
- [x] Add the `About` page route to `src/app/router/AppRouter.tsx`
- [x] Ensure fallback routing still behaves correctly

### 2. Navigation Integration

Add `About` to the shared navigation config so it appears in both desktop and mobile shell navigation automatically.

Checklist:

- [x] Add a navigation item to `src/app/router/navigation.ts`
- [x] Choose an icon that fits the product tone
- [x] Confirm desktop rail rendering remains balanced in shared config structure
- [x] Confirm mobile nav/menu rendering remains balanced in shared config structure

### 3. About Page Implementation

Build the page itself as a concise content surface using the shared Forge layout language.

Checklist:

- [x] Create `src/features/about/pages/AboutPage.tsx`
- [x] Add an intro/hero block
- [x] Add a short `why Forge exists` section
- [x] Add a short `about the developer` section
- [x] Add external link actions for LinkedIn and portfolio
- [x] Add a polished footer line
- [x] Keep copy concise and not overly promotional

### 4. Guest and Auth Visibility Validation

This page must appear identically inside the shell for:

- signed-in users
- guest-session users

Checklist:

- [x] Confirm route is reachable after Google sign-in via the shared protected shell
- [x] Confirm route is reachable after guest entry via the shared protected shell
- [x] Confirm shell/nav state can highlight `About` through the shared route config

### 5. Testing and Regression Coverage

Add enough coverage so the route and page do not regress later.

Checklist:

- [x] Add/update route coverage in `src/tests/app.spec.tsx`
- [x] Add page-level test for About page rendering
- [x] Verify link targets and visible content
- [x] Verify guest/auth shell access still behaves correctly through existing protected-shell coverage

### 6. Documentation

Record the feature once it is implemented.

Checklist:

- [x] Update `README.md` to mention the new About section
- [x] Update or extend this plan doc with completion notes after implementation

## Acceptance Criteria

The feature is complete when:

- `About` appears in desktop and mobile navigation
- `/about` renders inside the main shell
- signed-in users can access it
- guest users can access it
- the page includes:
  - short Forge background
  - short developer block
  - LinkedIn link
  - portfolio link
  - polished footer line
- the page feels visually consistent with the current Forge modernization work
- tests and build are green

## Validation Plan

Implementation should be verified with:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`

Manual/browser QA should confirm:

- desktop navigation presence
- mobile navigation presence
- Google-auth session access
- guest-session access
- external links open correctly
- page copy remains concise and visually balanced

## Notes For Implementation

- Do not overbuild this page into a marketing surface.
- Do not introduce new auth logic.
- Do not overload the page with long narrative text.
- Keep it personal, polished, and brief.
- Prefer reusing the modernized Forge page primitives rather than introducing a one-off visual system.

## Next Steps

- implementation complete
- run lint, typecheck, tests, and build
- do a quick shell/navigation QA pass in both authenticated and guest sessions
