import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/client'
import type { UserSettings } from '@/domain/settings/types'

export class FirestoreSettingsRepository {
  async upsert(userId: string, settings: UserSettings) {
    const db = getFirebaseFirestore()

    if (!db) {
      throw new Error('Firestore is unavailable.')
    }

    await setDoc(doc(db, 'users', userId, 'settings', settings.id), settings, { merge: true })
  }

  async getDefault(userId: string) {
    const db = getFirebaseFirestore()

    if (!db) {
      return null
    }

    const snapshot = await getDoc(doc(db, 'users', userId, 'settings', 'default'))

    return snapshot.exists() ? (snapshot.data() as UserSettings) : null
  }
}
