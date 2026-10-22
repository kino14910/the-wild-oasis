import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'

export function useCheckout() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: (bookingId: number) =>
      api.updateBookingStatus(bookingId, 'check_out'),

    onSuccess: data => {
      toast.success(t('hooks.checkout.success', { id: data.id }))
      queryClient.invalidateQueries({ type: 'active' })
    },

    onError: () => toast.error(t('hooks.checkout.error')),
  })

  return { checkout, isCheckingOut }
}
