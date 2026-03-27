import { useQuery } from '@tanstack/react-query'
import { getPhysicalWorkspace } from '@/services/physical/physicalPersistenceService'

export function usePhysicalWorkspace() {
  return useQuery({
    queryKey: ['physical-workspace'],
    queryFn: () => getPhysicalWorkspace(),
  })
}
