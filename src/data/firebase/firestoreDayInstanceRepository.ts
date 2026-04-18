import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore'
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

  async listAll(userId: string) {
    const db = getFirebaseFirestore()

    if (!db) {
      return []
    }

    const snapshot = await getDocs(collection(db, 'users', userId, 'dayInstances'))

    return snapshot.docs.map((entry) => entry.data() as DayInstance)
  }

  subscribeAll(userId: string, onChange: (instances: DayInstance[]) => void) {
    const db = getFirebaseFirestore()

    if (!db) {
      return () => {}
    }

    return onSnapshot(collection(db, 'users', userId, 'dayInstances'), (snapshot) => {
      onChange(snapshot.docs.map((entry) => entry.data() as DayInstance))
    })
  }
}
