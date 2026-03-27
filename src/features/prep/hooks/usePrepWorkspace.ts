import { useQuery } from '@tanstack/react-query'
import { getPrepWorkspace } from '@/services/prep/prepPersistenceService'

export function usePrepWorkspace() {
  return useQuery({
    queryKey: ['prep-workspace'],
    queryFn: () => getPrepWorkspace(),
  })
}
