import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { api } from '../../services/api'

const useBooking = () => {
  const { bookingId } = useParams()
  const {
    data: booking,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => api.getBooking(Number(bookingId)),
    retry: false,
  })
  return { booking, error, isLoading }
}

export default useBooking
