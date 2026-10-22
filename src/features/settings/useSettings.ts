import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'

export function useSettings() {
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  })
  return { isLoading, error, settings }
}
