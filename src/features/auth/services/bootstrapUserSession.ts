import type { User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/client'

export async function bootstrapUserSession(user: User) {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firestore is unavailable because Firebase configuration is incomplete.')
  }

  const userRef = doc(db, 'users', user.uid)
  const settingsRef = doc(db, 'users', user.uid, 'settings', 'default')
  const [userSnapshot, settingsSnapshot] = await Promise.all([getDoc(userRef), getDoc(settingsRef)])
  const batch = writeBatch(db)

  if (!userSnapshot.exists()) {
    batch.set(userRef, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    })
  } else {
    batch.set(
      userRef,
      {
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  if (!settingsSnapshot.exists()) {
    batch.set(settingsRef, {
      notificationsEnabled: true,
      calendarIntegration: {
        provider: 'google',
        connectionStatus: 'notConnected',
        featureGate: 'scaffoldingOnly',
        managedEventMode: 'disabled',
        selectedCalendarIds: [],
      },
      dayModeOverrides: {},
      dayTypeOverrides: {},
      dailySignals: {},
      prepTopicProgress: {},
      workoutLogs: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  await batch.commit()
}
