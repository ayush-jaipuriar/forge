import { collection, doc, getDoc, getDocs, limit, onSnapshot, query, setDoc, where } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/client'
import { serializeDayInstance } from '@/domain/routine/serialization'
import type { DayInstance } from '@/domain/routine/types'
import { withFirestoreReadTimeout } from '@/data/firebase/firestoreReadTimeout'

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

    const snapshot = await withFirestoreReadTimeout(
      getDoc(doc(db, 'users', userId, 'dayInstances', id)),
      'Loading today from Firestore',
    )

    if (snapshot.exists()) {
      return snapshot.data() as DayInstance
    }

    const byDateSnapshot = await withFirestoreReadTimeout(
      getDocs(query(collection(db, 'users', userId, 'dayInstances'), where('date', '==', id), limit(1))),
      'Finding today by date in Firestore',
    )
    const matchingSnapshot = byDateSnapshot.docs[0]

    return matchingSnapshot ? (matchingSnapshot.data() as DayInstance) : null
  }

  async getByDates(userId: string, ids: string[]) {
    const instances = await Promise.all(ids.map((id) => this.getByDate(userId, id)))

    return instances.filter((instance): instance is DayInstance => Boolean(instance))
  }

  async listAll(userId: string) {
    const db = getFirebaseFirestore()

    if (!db) {
      return []
    }

    const snapshot = await withFirestoreReadTimeout(
      getDocs(collection(db, 'users', userId, 'dayInstances')),
      'Loading day history from Firestore',
    )

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
