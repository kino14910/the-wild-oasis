import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { updateCurrentUser } from '../../services/apiAuth'

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      toast.success(t('hooks.updateUser.success'))
      // The mutation returns the auth user without the application role, so the
      // profile is refetched instead of being overwritten.
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return { updateUser, isUpdating }
}
