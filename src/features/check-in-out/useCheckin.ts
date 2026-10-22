import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { api } from '../../services/api'

export function useCheckin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: checkIn, isPending: isCheckingIn } = useMutation({
    mutationFn: async ({
      bookingId,
      breakfast,
    }: {
      bookingId: number
      breakfast?: { hasBreakfast: boolean }
    }) => {
      // Breakfast is a booking-level extra with a price impact, so it is
      // updated through the shared business API before the status change.
      if (breakfast?.hasBreakfast) {
        await api.updateBooking(bookingId, { hasBreakfast: true })
      }
      return api.updateBookingStatus(bookingId, 'check_in')
    },
    onSuccess: data => {
      toast.success(`Booking #${data.id} successfully checked in!`)
      queryClient.invalidateQueries({ type: 'active' })
      navigate('/')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { checkIn, isCheckingIn }
}
