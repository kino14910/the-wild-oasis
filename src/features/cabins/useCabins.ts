import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'

export function useCabins() {
  const {
    data: cabins,
    isLoading,
    error,
  } = useQuery({ queryKey: ['cabins'], queryFn: api.getCabins })
  return { cabins, isLoading, error }
}
