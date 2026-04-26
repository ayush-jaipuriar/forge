import { doc, getDoc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/client'
import type { UserSettings } from '@/domain/settings/types'
import { applySettingsSyncPatch, type SettingsSyncPatch } from '@/domain/settings/sync'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { withFirestoreReadTimeout } from '@/data/firebase/firestoreReadTimeout'

export class FirestoreSettingsRepository {
  async upsert(userId: string, settings: UserSettings) {
    const db = getFirebaseFirestore()

    if (!db) {
      throw new Error('Firestore is unavailable.')
    }

    await setDoc(doc(db, 'users', userId, 'settings', settings.id), settings, { merge: true })
  }

  async patch(userId: string, patch: SettingsSyncPatch) {
    const db = getFirebaseFirestore()

    if (!db) {
      throw new Error('Firestore is unavailable.')
    }

    const settingsRef = doc(db, 'users', userId, 'settings', patch.settingsId)

    try {
      await updateDoc(settingsRef, buildFirestoreSettingsPatchData(patch))
    } catch (error) {
      const message = error instanceof Error ? error.message : ''

      if (!message.toLowerCase().includes('no document')) {
        throw error
      }

      await setDoc(settingsRef, applySettingsSyncPatch(createDefaultUserSettings(), patch))
    }
  }

  async getDefault(userId: string) {
    const db = getFirebaseFirestore()

    if (!db) {
      return null
    }

    const snapshot = await withFirestoreReadTimeout(
      getDoc(doc(db, 'users', userId, 'settings', 'default')),
      'Loading settings from Firestore',
    )

    return snapshot.exists() ? (snapshot.data() as UserSettings) : null
  }

  subscribeDefault(userId: string, onChange: (settings: UserSettings | null) => void) {
    const db = getFirebaseFirestore()

    if (!db) {
      return () => {}
    }

    return onSnapshot(doc(db, 'users', userId, 'settings', 'default'), (snapshot) => {
      onChange(snapshot.exists() ? (snapshot.data() as UserSettings) : null)
    })
  }
}

function buildFirestoreSettingsPatchData(patch: SettingsSyncPatch) {
  switch (patch.type) {
    case 'setNotificationsEnabled':
      return {
        notificationsEnabled: patch.value,
        updatedAt: patch.updatedAt,
      }
    case 'setCalendarIntegration':
      return {
        calendarIntegration: patch.value,
        updatedAt: patch.updatedAt,
      }
    case 'mergeDayModeOverrides':
      return buildFirestoreRecordPatch('dayModeOverrides', patch.entries, patch.updatedAt)
    case 'mergeDayTypeOverrides':
      return buildFirestoreRecordPatch('dayTypeOverrides', patch.entries, patch.updatedAt)
    case 'mergeDailySignals':
      return buildFirestoreRecordPatch('dailySignals', patch.entries, patch.updatedAt)
    case 'mergePrepTopicProgress':
      return buildFirestoreRecordPatch('prepTopicProgress', patch.entries, patch.updatedAt)
    case 'mergeWorkoutLogs':
      return buildFirestoreRecordPatch('workoutLogs', patch.entries, patch.updatedAt)
  }
}

function buildFirestoreRecordPatch(
  subtree:
    | 'dayModeOverrides'
    | 'dayTypeOverrides'
    | 'dailySignals'
    | 'prepTopicProgress'
    | 'workoutLogs',
  entries: Record<string, unknown>,
  updatedAt: string,
) {
  const patchData: Record<string, unknown> = {
    updatedAt,
  }

  for (const [key, value] of Object.entries(entries)) {
    patchData[`${subtree}.${key}`] = value === null ? deleteField() : value
  }

  return patchData
}
