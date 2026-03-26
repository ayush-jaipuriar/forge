import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/client'
import { serializeDayInstance } from '@/domain/routine/serialization'
import type { DayInstance } from '@/domain/routine/types'

export class FirestoreDayInstanceRepository {
  async upsert(userId: string, instance: DayInstance) {
    const db = getFirebaseFirestore()

    if (!db) {
      throw new Error('Firestore is unavailable.')
    }

    await setDoc(doc(db, 'users', userId, 'dayInstances', instance.id), serializeDayInstance(instance), {
      merge: true,
    })
  }

  async getByDate(userId: string, id: string) {
    const db = getFirebaseFirestore()

    if (!db) {
      return null
    }

    const snapshot = await getDoc(doc(db, 'users', userId, 'dayInstances', id))

    return snapshot.exists() ? (snapshot.data() as DayInstance) : null
  }
}
