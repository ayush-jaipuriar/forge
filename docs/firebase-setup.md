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

Milestone 2 will:

- initialize the Firebase app
- attach Firebase Auth
- enable Google Sign-In
- define Firestore bootstrap flows for the first signed-in user
