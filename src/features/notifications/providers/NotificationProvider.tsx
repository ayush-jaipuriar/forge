import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { evaluateAndDeliverNotifications } from '@/services/notifications/notificationDeliveryService'

export function NotificationProvider({ children }: PropsWithChildren) {
  const { status } = useAuthSession()

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    void evaluateAndDeliverNotifications()

    function handleFocus() {
      void evaluateAndDeliverNotifications()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [status])

  return children
}
