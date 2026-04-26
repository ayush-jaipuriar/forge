const FIRESTORE_READ_TIMEOUT_MS = 12_000

export async function withFirestoreReadTimeout<T>(operation: Promise<T>, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} took too long to respond. Check your connection and try again.`))
    }, FIRESTORE_READ_TIMEOUT_MS)
  })

  try {
    return await Promise.race([operation, timeout])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
