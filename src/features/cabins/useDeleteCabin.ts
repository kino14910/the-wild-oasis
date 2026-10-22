import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'

export function useDeleteCabin() {
  const queryClient = useQueryClient()

  const { isPending: isDeleting, mutate: deleteCabin } = useMutation({
    mutationFn: (id: number) => api.deleteCabin(id),
    onSuccess: () => {
      toast.success('Cabin deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['cabins'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { isDeleting, deleteCabin }
}
