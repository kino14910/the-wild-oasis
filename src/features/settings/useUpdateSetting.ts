import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'

export function useUpdateSetting() {
  const queryClient = useQueryClient()

  const { mutate: updateSetting, isPending: isUpdating } = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      toast.success('Setting successfully edited')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return { isUpdating, updateSetting }
}
