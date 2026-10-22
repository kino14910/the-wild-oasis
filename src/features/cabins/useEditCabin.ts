import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'

export function useEditCabin() {
  const queryClient = useQueryClient()

  const { mutate: editCabin, isPending: isEditing } = useMutation({
    mutationFn: ({
      newCabinData,
      id,
    }: {
      newCabinData: Parameters<typeof api.updateCabin>[1]
      id: number
    }) => api.updateCabin(id, newCabinData),
    onSuccess: () => {
      toast.success('Cabin successfully edited')
      queryClient.invalidateQueries({ queryKey: ['cabins'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return { isEditing, editCabin }
}
