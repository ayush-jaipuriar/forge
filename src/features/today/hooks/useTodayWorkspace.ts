import { useQuery } from '@tanstack/react-query'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'

export function useTodayWorkspace() {
  return useQuery({
    queryKey: ['today-workspace'],
    queryFn: () => getOrCreateTodayWorkspace(),
  })
}
