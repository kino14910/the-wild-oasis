import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { api } from '../../services/api'

export function useDashboardData() {
  const [searchParams] = useSearchParams()
  const last = Number(searchParams.get('last') ?? 7)
  const rangeDays = (last === 30 || last === 90 ? last : 7) as 7 | 30 | 90

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', rangeDays],
    queryFn: () => api.getAnalytics(rangeDays),
  })

  return { analytics: data, isLoading, error, rangeDays }
}
