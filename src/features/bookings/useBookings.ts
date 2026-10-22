import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { api, type BookingStatus } from '../../services/api'
import { PAGE_SIZE } from '../../utils/constants'

const useBookings = () => {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const status = (searchParams.get('status') ?? 'all') as BookingStatus
  const sortByRaw = searchParams.get('sortBy') || 'startDate-desc'
  const [field, direction] = sortByRaw.split('-')
  const page = !searchParams.get('page') ? 1 : Number(searchParams.get('page'))

  const {
    data: { data: bookings, count } = {},
    error,
    isLoading,
  } = useQuery({
    queryKey: ['bookings', status, sortByRaw, page],
    queryFn: () =>
      api.getBookings({
        status,
        sortBy: field as 'startDate' | 'created_at' | 'totalPrice',
        direction: direction as 'asc' | 'desc',
        page,
      }),
  })

  if (count && page < Math.ceil(count / PAGE_SIZE)) {
    queryClient.prefetchQuery({
      queryKey: ['bookings', status, sortByRaw, page + 1],
      queryFn: () =>
        api.getBookings({
          status,
          sortBy: field as 'startDate' | 'created_at' | 'totalPrice',
          direction: direction as 'asc' | 'desc',
          page: page + 1,
        }),
    })
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ['bookings', status, sortByRaw, page - 1],
      queryFn: () =>
        api.getBookings({
          status,
          sortBy: field as 'startDate' | 'created_at' | 'totalPrice',
          direction: direction as 'asc' | 'desc',
          page: page - 1,
        }),
    })
  }

  return { bookings, error, isLoading, count }
}
export default useBookings
