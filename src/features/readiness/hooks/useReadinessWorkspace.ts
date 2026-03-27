import { useQuery } from '@tanstack/react-query'
import { getReadinessWorkspace } from '@/services/readiness/readinessPersistenceService'

export function useReadinessWorkspace() {
  return useQuery({
    queryKey: ['readiness-workspace'],
    queryFn: () => getReadinessWorkspace(),
  })
}
