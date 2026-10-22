import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'

export function useConfirmBooking() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: confirmBooking, isPending: isConfirming } = useMutation({
    mutationFn: (bookingId: number) =>
      api.updateBookingStatus(bookingId, 'confirm'),
    onSuccess: data => {
      toast.success(t('hooks.confirm.success', { id: data.id }))
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', String(data.id)] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return { confirmBooking, isConfirming }
}
