# Firebase Setup

## Phase 1 Intent

Firebase will be wired for real in Phase 1, with Google Sign-In as the only authentication provider and Firestore as the primary persisted store.

## Environment Variables

The project expects the following variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Next Implementation Step

Milestone 2 now wires:

- Firebase app initialization
- Firebase Auth session observation
- Google Sign-In via popup
- Firestore bootstrap flows for the first signed-in user

## Auth Flow

1. Forge initializes Firebase from environment variables.
2. The auth session provider subscribes to `onAuthStateChanged`.
3. When a user is present, Forge bootstraps:
   - `users/{uid}`
   - `users/{uid}/settings/default`
4. Protected routes render only after the authenticated session is ready.

## Local Verification Note

Without real Firebase project values in `.env`, the app will honestly show a configuration warning on the sign-in screen instead of pretending auth is available.
