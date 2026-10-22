import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'

// Cancelling releases the reserved dates through the shared business API,
// which enforces the booking state machine.
export function useDeleteBooking() {
  const queryClient = useQueryClient()

  const { isPending: isDeleting, mutate: deleteBooking } = useMutation({
    mutationFn: (bookingId: number) =>
      api.updateBookingStatus(bookingId, 'cancel'),
    onSuccess: () => {
      toast.success('Booking successfully cancelled')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return { isDeleting, deleteBooking }
}
