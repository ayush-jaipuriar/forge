You are a senior staff-level full-stack engineer and product-minded systems architect.

Your task is to build a near-production personal execution web app called **Forge**.

This is not a toy dashboard, not a startup SaaS template, and not generic AI slop. It must feel like a **premium dark-mode personal war-room OS** for disciplined execution, designed first for one demanding user but architected cleanly enough to evolve into a broader product later.

The app must be:
- installable as a **PWA**
- usable on both **desktop and mobile**
- optimized for **mobile daily execution** and **desktop planning/analytics**
- connected to **Google Cloud / Firebase**
- built with a clean architecture from day one
- dark-mode only
- premium, sharp, serious, minimal, masculine, intense
- heavily focused on reducing friction and manual data entry resistance

The app’s name is: **Forge**

==================================================
1. CORE PRODUCT IDENTITY
==================================================

Forge is a **personal war-room execution OS**.

It is designed to help the user:
- follow a fixed daily/weekly routine with military precision
- maximize job-switch preparation for a late-May readiness target
- track both interview prep and workouts with equal importance
- detect patterns, bottlenecks, drift, and underperformance
- adapt intelligently when the day breaks down
- provide brutal and honest scoring rather than feel-good vanity metrics

Tone:
- moderately themed war-room language
- not cringe, not cosplay, not cartoonish
- professional copy with strong labels and states
- “stoic masculinity”, “intense war room”, “sharp premium dark dashboard”

It should NOT feel like:
- a Notion clone
- a bright playful gamified habit app
- a generic startup analytics dashboard
- corporate HR software
- cluttered personal productivity soup
- fluffy self-help journaling software

Design references:
- Apple Fitness energy and confidence
- premium dark modern SaaS polish
- military command center seriousness
- sharp disciplined edges
- smooth premium animation
- balanced density, not sparse and not overwhelming

==================================================
2. REQUIRED TECH STACK (LOCKED)
==================================================

Use this stack exactly unless a tiny implementation detail requires an equivalent library swap:

Frontend:
- React
- Vite
- TypeScript

UI:
- Material UI (MUI), but heavily customized so it does NOT look like default MUI
- Create a custom design system/theme on top of MUI

State / data:
- Zustand for app state/UI state
- TanStack Query for async/server/cache state

Backend platform:
- Firebase ecosystem

Auth:
- Firebase Auth
- Google Sign-In only

Database:
- Firestore

Hosting:
- Firebase Hosting preferred
- acceptable to use equivalent Firebase-native deployment if needed

PWA / Offline:
- installable PWA
- service worker
- local cache / IndexedDB
- offline queue for actions
- sync when connection returns

Notifications:
- Firebase Cloud Messaging / browser notifications where appropriate

Calendar:
- Google Calendar API integration

Architecture note:
- DO NOT use Spring Boot in V1
- However, structure the app and service boundaries so that a future dedicated backend (such as Spring Boot) can be added later without a rewrite

Health integration:
- NOT in V1
- Architecture must be prepared for future wearable/health integration
- Use manual logging in V1
- Add a future-ready abstraction/service interface for health data providers

==================================================
3. BUILD STRATEGY
==================================================

Build everything in **one codebase** with a staged architecture.

Implementation phases:
- Phase 1: core Forge execution system
- Phase 2: analytics, command center, pattern detection, projections
- Phase 3: integrations, notifications, calendar sync, export, polish

Important:
- The codebase should include all phases in architectural planning
- But implementation should be staged cleanly
- Phase 1 must be fully functional and production-quality
- Phase 2 and Phase 3 should be scaffolded cleanly with clear extension points
- Avoid overengineering where not needed, but do not cut corners in architecture

==================================================
4. PRIMARY USER AND PRODUCT GOAL
==================================================

Primary user:
- one user only for now
- but architect so multi-user support is feasible later

Primary use case:
- the user is preparing for a job switch
- wants strict routine adherence
- wants daily execution and quantified feedback
- wants both prep and workouts treated seriously
- wants the system to feel like his personal operating system, not a casual tracker

Core outcomes Forge must drive:
- enforce routine adherence
- minimize friction in daily logging
- provide clear “what now?” direction
- detect slippage early
- maintain consistency across WFH/WFO/weekend/low-energy contexts
- show whether the current pace supports readiness by the target date

==================================================
5. ROUTINE MODEL (FIXED IN V1)
==================================================

The routine is hardcoded in V1 and not editable from the UI.

However:
- it must be defined cleanly in structured config / seeded JSON / TypeScript config
- the user must be able to change it later via code/config without invasive rewrites
- UI should support manual override behaviors, but not full editing in V1

V1 day types:
- WFH High Output Day
- WFO Continuity Day
- Weekend Deep Work Day
- Low Energy Day
- Survival / Terrible Day

Rules:
- app auto-selects day type based on weekday
- user can manually override day type
- user can mark blocks skipped
- user can move a block to later
- user can activate fallback mode
- user can mark workout done / skipped / rescheduled

==================================================
6. FIXED SCHEDULE / ROUTINE CONTENT TO SEED
==================================================

Seed the app with the following routine structure.

--------------------------------------------------
A. WEEKLY STRUCTURE
--------------------------------------------------

Monday:
- WFH High Output
- Focus: DSA + Java/Backend + Gym

Tuesday:
- WFO Continuity
- Focus: System Design retention

Wednesday:
- WFO Continuity
- Focus: LLD / DSA retention

Thursday:
- WFH High Output
- Focus: LLD + Backend + Gym

Friday:
- WFH High Output
- Focus: System Design + AI/Behavioral + Gym

Saturday:
- Weekend Deep Work
- Focus: DSA + LLD + Backend/Mock + optional gym

Sunday:
- Weekend Consolidation
- Focus: System Design + DSA + weekly analytics view + gym/recovery

--------------------------------------------------
B. WFH HIGH OUTPUT TEMPLATE
--------------------------------------------------

Wake target:
- 7:00–7:15 AM

Sleep target:
- 11:15–11:30 PM

Morning activation:
- hydration
- light movement
- sunlight/exposure
- no phone scroll

Prime deep block:
- 8:00–9:20 AM
- highest-value block of the day
- intended for:
  - DSA
  - System Design
  - LLD
- output required

Mini prep block:
- around lunch, 20–30 min
- maintenance/review

Evening:
- workout block
- light prep block after workout
- next-day planning

WFH expectations:
- morning deep block completed
- mini prep or secondary block completed
- workout completed if scheduled
- at least 2 hours prep total target on qualifying days

--------------------------------------------------
C. WFO CONTINUITY TEMPLATE
--------------------------------------------------

Morning micro block:
- short prep before leaving

Lunch quick review:
- 10–20 min

Night:
- optional light review or rest

WFO expectations:
- reduced scoring weights / adjusted expectations
- continuity over intensity
- preserve streak and momentum

--------------------------------------------------
D. WEEKEND DEEP WORK TEMPLATE
--------------------------------------------------

Saturday:
- Deep Block 1
- Deep Block 2
- Additional focused block(s)
- optional gym
- controlled project/admin/revision block

Sunday:
- Deep Block 1
- Deep Block 2
- lighter support block
- analytics dashboard review only (not reflective journaling)
- gym or active recovery

--------------------------------------------------
E. FALLBACK DAY TYPES
--------------------------------------------------

Low Energy Day:
- reduce load
- preserve momentum
- lighter tasks
- maintain minimum viable day

Survival Day:
- absolute minimum
- salvage mode
- keep streak alive
- protect sleep and recovery

==================================================
7. APP BEHAVIOR MODEL
==================================================

The app should feel strict but adaptive.

Behavior philosophy:
- normal mode: strict
- when the day breaks: flip quickly into salvage mode
- this is “dual mode”

Rules:
- missed morning deep block => mark it missed
- if work spills over and evening becomes unrealistic => show tradeoff choice
- if day performance degrades => suggest fallback mode automatically
- scoring and expectations must adjust by day type
- weekends use a different scoring profile than WFO days
- energy level should influence recommendations

Add a visible “day mode selector” with options like:
- Ideal Day
- Normal Day
- Low Energy Day
- Survival Day

==================================================
8. MANUAL DATA ENTRY PHILOSOPHY
==================================================

A critical product requirement: the app must minimize data entry resistance.

The user will stop using the app if it becomes admin-heavy.

Design interactions so that:
- marking a prep block done is quick
- block skipped should be auto-friendly
- switching to fallback mode should be easy and suggestion-driven
- workout done should be quick
- sleep should be auto-ready later, manual in V1
- topic confidence updates should be low friction
- quick notes are easy
- export/backup should be automated where possible

Translate these into UX principles:
- one-tap interactions wherever possible
- quick chips, toggles, swipe/press actions on mobile
- avoid form-heavy flows
- do not bury core actions behind menus
- mobile daily use must feel frictionless

==================================================
9. INFORMATION ARCHITECTURE / NAVIGATION
==================================================

Desktop main nav:
- Today
- Schedule
- Prep
- Physical
- Command Center
- Readiness
- Settings

Mobile should prioritize:
- Today
- quick actions
- workout logging
- marking blocks done
- status awareness

Use bottom nav or an equivalent mobile-friendly navigation model.

==================================================
10. PRIMARY SCREENS
==================================================

Build the following screens/views.

--------------------------------------------------
A. TODAY SCREEN (MOST IMPORTANT)
--------------------------------------------------

This is the heart of the app.

Requirements:
- mobile-first
- long-form scrollable layout
- full day visible by default
- dynamic tone/state based on performance

Today screen should prominently include, in priority order:
1. Today’s agenda / time blocks
2. Top 3 priorities
3. Current block
4. Daily score
5. Habits / streak context
6. Workout card
7. Prep progress by topic
8. Missed blocks / recovery suggestion
9. Quick log buttons
10. Sleep / energy status

Also include:
- “What should I do now?” button (non-AI rules-based logic in V1)
- current day mode/state
- war-state indicator
- block completion actions
- fallback mode suggestion when appropriate
- manual override controls where allowed

Status states:
- On Track
- Slipping
- Salvage Mode
- Critical

The app tone should shift visibly based on state.

--------------------------------------------------
B. SCHEDULE SCREEN
--------------------------------------------------

Purpose:
- show weekly layout
- show day templates
- show block structure
- allow limited operational changes:
  - switch day type manually
  - move block later
  - mark skipped
  - activate fallback mode
- DO NOT allow full routine editing in V1

Include:
- week view
- per-day card/details
- routine legend
- major block highlighting
- calendar mirror status if integrated

--------------------------------------------------
C. PREP SCREEN
--------------------------------------------------

Purpose:
- track interview prep in a deeply structured way

Sections:
- DSA
- System Design
- LLD
- Java / Backend
- CS fundamentals / AI prep as secondary

Must support:
- preloaded taxonomy
- progress tracking
- confidence tracking
- revision count
- solved count where relevant
- topic/subtopic drill-down
- readiness contribution

Confidence scale:
- Low
- Medium
- High

--------------------------------------------------
D. PHYSICAL SCREEN
--------------------------------------------------

Purpose:
- workout and sleep tracking
- equally prominent in the product as prep

Requirements:
- scheduled workout type
- mark workout done / skipped / rescheduled
- optional quick note
- sleep logging (manual in V1)
- physical score
- physical consistency trend

Do NOT build a full bodybuilding logbook in V1.
Keep it lightweight.

--------------------------------------------------
E. COMMAND CENTER SCREEN
--------------------------------------------------

Purpose:
- serious quantified-self analytics cockpit

This is desktop-heavy.

Include charts and analytics cards.

Chart priority order:
1. projected readiness curve
2. prep hours by topic
3. sleep vs performance correlation
4. WFO vs WFH comparison
5. best-performing time window
6. daily completion heatmap
7. deep block completion trend
8. gym vs productivity correlation
9. streak calendar
10. score trend

Also include:
- bottleneck detection
- pattern detection
- risk cards
- “you are behind” style alerts where appropriate
- war-room style big status indicators

--------------------------------------------------
F. READINESS SCREEN
--------------------------------------------------

Purpose:
- overall interview readiness tracking
- progression toward target date

Requirements:
- seeded target date: May 31, 2026
- configurable in code later
- readiness broken down by major domain
- show pace vs target
- show domain readiness states
- show whether current velocity supports target date

--------------------------------------------------
G. SETTINGS SCREEN
--------------------------------------------------

Include:
- auth / account
- Google Calendar connection status
- notifications preferences
- export / backup
- PWA install/help state
- feature flags / future health integration placeholder
- app metadata/version info

==================================================
11. PREP TAXONOMY (PRELOADED)
==================================================

Seed the app with structured prep taxonomy.

--------------------------------------------------
A. DSA
--------------------------------------------------

Top-level topics:
- Arrays
- Strings
- Hashing
- Two Pointers
- Sliding Window
- Stack
- Queue
- Linked List
- Trees
- BST
- Heaps / Priority Queue
- Binary Search
- Recursion
- Backtracking
- Graphs
- Dynamic Programming
- Greedy
- Intervals
- Tries
- Union Find / DSU
- Bit Manipulation

Each item should support:
- confidence: Low / Medium / High
- revision count
- solved count
- hours spent
- completion / exposure state

--------------------------------------------------
B. SYSTEM DESIGN
--------------------------------------------------

Core concepts:
- Scalability
- Load Balancing
- Caching
- Database Selection
- Indexing
- Sharding
- Replication
- CAP / consistency tradeoffs
- Queues / event-driven systems
- Rate Limiting
- CDN
- File storage
- Observability
- Failover / resilience
- API gateway
- authentication / authorization basics
- id generation
- search indexing
- websocket / realtime basics

Case studies:
- URL Shortener
- Chat System
- Notification System
- News Feed
- File Storage / Dropbox-like system
- Search Autocomplete
- Ride Matching
- Video Streaming
- Rate Limiter system
- Payment ledger basics
- Job scheduler
- Metrics / logging system

Track:
- confidence
- exposure count
- hours spent
- notes
- readiness relevance

--------------------------------------------------
C. LLD
--------------------------------------------------

Core:
- OOP basics
- SOLID
- composition vs inheritance
- interfaces / abstractions
- immutability
- encapsulation
- coupling / cohesion

Patterns:
- Strategy
- Factory
- Abstract Factory
- Builder
- Adapter
- Observer
- Decorator
- Singleton
- State
- Command
- Template Method
- Chain of Responsibility

Canonical interview problems:
- Parking Lot
- Elevator System
- Vending Machine
- Splitwise
- Tic Tac Toe
- Library Management
- Chess
- Snake and Ladder
- Car Rental
- BookMyShow style ticketing
- ATM

Track:
- confidence
- implementation comfort
- exposure count
- notes
- readiness

--------------------------------------------------
D. JAVA / BACKEND
--------------------------------------------------

Java core:
- collections
- generics
- streams
- exceptions
- lambdas
- memory model
- JVM basics
- garbage collection
- concurrency
- multithreading
- locks / synchronization
- executors
- completable future

Spring / backend:
- Spring Core
- Spring Boot
- dependency injection
- REST API design
- validation
- JPA / Hibernate
- transactions
- caching
- messaging
- security basics
- microservice basics
- API gateway basics
- logging
- monitoring
- testing

System/backend depth:
- database indexing
- pagination
- idempotency
- retries
- circuit breakers
- eventual consistency
- file uploads
- auth/session/token
- rate limiting
- backend architecture patterns

Track:
- confidence
- revision count
- hours spent
- notes
- readiness

==================================================
12. WORKOUT MODEL (SEED)
==================================================

Seed a lightweight hybrid-bodybuilding routine representation.

Workouts should be scheduled by day type / weekday:
- Monday: Upper A
- Thursday: Lower A
- Friday: Upper B
- Sunday: Lower B / Recovery
- Saturday: optional accessory / pump / mobility
- Tuesday/Wednesday: mostly no major workout expected due to WFO load

Track in V1:
- scheduled workout type
- done / skipped / moved
- quick note
- miss reason if skipped
- completion trend

Do NOT build detailed sets/reps logging in V1.

==================================================
13. SLEEP MODEL
==================================================

V1:
- manual sleep logging
- should be fast
- prepare abstraction for future automated sync

Track:
- sleep duration
- whether target met
- relation to daily performance

==================================================
14. SCORING SYSTEM
==================================================

Scoring must be brutal and honest.

Use:
- one master daily score
- multiple subscores

Display:
- exact number
- label
- war-state indicator

Suggested war-state labels:
- 85+ = Dominant
- 70–84 = On Track
- 50–69 = Slipping
- below 50 = Critical

Use this scoring philosophy:

Master Daily Score = 100 points

A. Deep Work Score — 35
- prime morning deep block completed: 25
- meaningful output captured: 10

B. Prep Execution Score — 20
- secondary prep or mini block completed: 10
- total prep time target met: 10

C. Physical Execution Score — 15
- scheduled workout completed: 10
- sleep target met: 5

D. Discipline Score — 15
- no major rabbit hole: 7
- next-day planning / day hygiene: 4
- tracking/logging compliance: 4

E. Day-Type Compliance Score — 15
- expectations met relative to day type:
  - WFH
  - WFO
  - Weekend
  - Low Energy
  - Survival

Also compute subscores:
- Interview Prep Score
- Physical Score
- Discipline Score
- Consistency Score
- Master Score

Important:
- morning deep block is the single highest-value unit
- low-value easy tasks should not inflate score if deep work is missed
- WFO days should not be punished unfairly
- weekends should have a distinct expected profile

==================================================
15. PATTERN DETECTION / ANALYTICS ENGINE
==================================================

Pattern detection is a central product feature.

Priority categories:

Critical:
- sleep vs prep quality correlation
- gym frequency vs mental performance
- topic neglect detection
- weekend utilization
- most missed blocks by time of day
- best-performing time window
- streak break causes
- pace prediction toward target date
- habit correlation with high-score days

Useful:
- WFO vs WFH performance difference
- deep block completion trend
- readiness progression pace
- behind-target warnings
- low-energy task type success patterns

Represent insights using:
- dashboard cards
- charts
- summaries
- warnings/alerts

Insight tone:
- analytical + coach-like
- serious, not preachy

Examples of insight types:
- “Your best-performing cognitive window is 8:00–10:00 AM.”
- “Sleep under 7 hours correlates with a 22% lower prep score.”
- “WFO Wednesdays have the highest block miss rate.”
- “You are underweighting LLD relative to your target readiness.”
- “At current pace, readiness target slips past May 31.”

Implement the engine in a modular way so more rules can be added later.

==================================================
16. GAMIFICATION SYSTEM
==================================================

Gamification should be mature and disciplined.

Include:
- streaks
- ranks / tiers
- weekly missions
- readiness levels
- warning states
- achievement badges (serious, not childish)
- progress rings
- momentum meter
- discipline score
- “on track / behind / critical” indicators

Do NOT include:
- confetti
- childish trophies
- mascots
- arcade visuals
- bright toy-like interactions

Use red/amber/green status systems prominently, but tastefully.

War-room terminology should be present but restrained.

==================================================
17. NOTIFICATIONS
==================================================

Max notifications:
- 3 per day maximum

Mobile is primary.

Priority notifications:
1. missed critical block
2. fallback mode suggestion
3. weekly summary

Rules:
- conditional notifications only
- no spam
- no bedtime reminder in V1
- notifications should depend on day type, score risk, and whether salvage is still possible

==================================================
18. GOOGLE CALENDAR INTEGRATION
==================================================

Implement calendar integration in staged fashion.

Requirements:
- read from Google Calendar
- write to Google Calendar
- use user’s existing primary calendar
- only mirror major blocks
- mark Forge events via:
  - event title prefix
  - color coding
  - description metadata

Event prefix format:
- [FORGE] <block title>

External events should affect schedule logic:
- detect collisions
- flag schedule pressure
- support tradeoff decisions
- special treatment for likely interviews / important events later

==================================================
19. OFFLINE-FIRST REQUIREMENTS
==================================================

Basic critical functions must work offline:
- viewing Today screen
- marking tasks/blocks complete
- logging workout
- writing notes
- viewing recent cached analytics
- queueing sync actions for later

Implement:
- local-first UX where possible
- sync queue
- conflict-safe update patterns
- clear but subtle sync status indicators

==================================================
20. DATA MODEL REQUIREMENTS
==================================================

Use Firestore with a clean schema design.

You must design and implement a sensible schema covering:
- users
- routine templates
- day instances
- block instances
- completion logs
- prep taxonomy
- prep progress
- workout schedule
- workout logs
- sleep logs
- scores
- streaks
- readiness metrics
- analytics snapshots / derived summaries
- notifications state
- settings
- calendar sync metadata

Requirements:
- type-safe interfaces/types
- normalized where useful, denormalized where practical for performance
- future multi-user support possible
- sensible indexing considerations
- seed data support

Also support export/backup:
- JSON export
- CSV where relevant
- markdown-friendly note export if possible

==================================================
21. UX / VISUAL DESIGN REQUIREMENTS
==================================================

Dark mode only.

Visual direction:
- premium dark
- sharp disciplined edges
- modern SaaS typography
- balanced spacing
- smooth premium animation
- Apple-like vibrant accent colors used tastefully
- avoid rainbow clutter
- strong hierarchy
- strong use of color for status and urgency

Need a custom design system including:
- typography scale
- spacing scale
- border radius strategy
- elevation/shadow strategy
- accent palette
- semantic state colors
- chart styling
- card patterns
- status badge styles
- metric tile styles
- streak / readiness visual language
- command center visualization language

Build the UI so it feels like a real premium product.

==================================================
22. PWA REQUIREMENTS
==================================================

Must support:
- install on Android Chrome
- install on desktop Chrome/Edge
- proper manifest
- icons/placeholders
- splash behavior where applicable
- app-like shell
- resilient loading
- offline handling
- installability UX

==================================================
23. WHAT SHOULD I DO NOW? ENGINE
==================================================

Implement a rules-based recommendation engine in V1 (NOT AI).

Purpose:
- the user presses “What should I do now?”
- app recommends the highest-value next action based on:
  - current time
  - day type
  - completed blocks
  - missed blocks
  - energy level
  - workout state
  - schedule pressure
  - calendar conflicts
  - fallback state

Examples:
- “Execute Morning Deep Block now.”
- “You missed prime deep work. Move to salvage plan: 20-minute review block.”
- “Workout window is closing. Train Upper A now.”
- “WFO day expectations met. Shift to recovery.”

Make this logic modular and testable.

==================================================
24. SETTINGS / FEATURE FLAGS / FUTURE READINESS
==================================================

Even if not fully used in V1, structure the app for future extension in:
- health integration providers
- AI assistant / coach
- more domains such as finance, projects, life planning
- routine editing
- multi-user/product mode
- more advanced backend later

Add internal architecture boundaries to support this cleanly.

==================================================
25. CODE QUALITY REQUIREMENTS
==================================================

This is critical.

Generate clean, professional, maintainable code.

Requirements:
- TypeScript everywhere appropriate
- good folder structure
- separation of concerns
- reusable components
- clearly separated domain logic
- avoid giant god-components
- avoid hardcoding all logic into UI
- use custom hooks where appropriate
- use service/repository abstractions where it helps
- write utility functions clearly
- use descriptive names
- keep styles/theming systematic
- prepare for future feature growth

Also include:
- README
- architecture overview
- env setup
- Firebase setup instructions
- Google Calendar setup instructions
- deployment steps
- future roadmap notes

==================================================
26. TESTING REQUIREMENTS
==================================================

Include a reasonable testing foundation:
- unit tests for core scoring logic
- unit tests for recommendation logic
- tests for analytics rule helpers where feasible
- component tests for key UI pieces if practical
- basic integration confidence for core flows

Do not overdo test boilerplate, but ensure critical logic is tested.

==================================================
27. DELIVERABLES YOU MUST PRODUCE
==================================================

Produce all of the following:

1. Full app code
2. Clean project structure
3. Seed data/config for:
   - routine templates
   - prep taxonomy
   - workout schedule
4. Custom dark premium theme
5. PWA setup
6. Firebase auth/firestore integration
7. Offline queue/cache behavior
8. Core screens
9. Scoring engine
10. Recommendation engine
11. Analytics scaffolding and Phase 2-ready structure
12. Calendar integration scaffolding / implementation according to stage
13. README
14. Architecture docs
15. Deployment guide
16. Environment variable example file
17. Future extension notes

==================================================
28. IMPLEMENTATION ORDER
==================================================

Implement in this order:

Phase 1:
- app shell
- auth
- theme
- routing/navigation
- Today screen
- routine config
- day/block model
- completion logging
- workout logging
- sleep logging
- scoring engine
- prep taxonomy + prep tracking
- readiness basics
- offline basics
- PWA basics

Phase 2:
- Command Center
- charts
- pattern detection engine
- projections
- streaks / missions / momentum
- advanced warnings and insights

Phase 3:
- Google Calendar read/write
- notifications
- export/backup
- more polished sync behavior
- health integration scaffolding polish

==================================================
29. IMPORTANT PRODUCT GUARDRAILS
==================================================

Do NOT do these:
- do not make it editable like a general no-code habit app
- do not make it look playful
- do not add fluff journaling/review systems
- do not overload the user with manual forms
- do not create a shallow dashboard with fake metrics
- do not use bright, childish gamification
- do not let low-value task completion overpower deep work in scoring
- do not make mobile an afterthought
- do not make desktop just a stretched mobile layout

==================================================
30. OUTPUT FORMAT
==================================================

First, provide:
1. a short architecture summary
2. the folder structure
3. implementation plan by phase

Then proceed to generate the code and files needed.

If the output must be staged due to size:
- start with the full architecture and Phase 1 implementation
- include clear markers for subsequent files/steps
- do not simplify the product into a toy
- preserve the design and architecture intent

Build Forge like a real product.