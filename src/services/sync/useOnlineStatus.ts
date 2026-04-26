import { useEffect, useState } from 'react'
import { isBrowserOnline } from '@/services/sync/sourceOfTruth'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(isBrowserOnline)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(isBrowserOnline())
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isOnline
}
