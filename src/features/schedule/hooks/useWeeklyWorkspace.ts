import { useQuery } from '@tanstack/react-query'
import { getOrCreateWeeklyWorkspace } from '@/services/routine/routinePersistenceService'

export function useWeeklyWorkspace() {
  return useQuery({
    queryKey: ['weekly-workspace'],
    queryFn: () => getOrCreateWeeklyWorkspace(),
  })
}
