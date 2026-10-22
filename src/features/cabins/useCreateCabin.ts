import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../services/api'

interface CabinData {
  name: string
  maxCapacity: number
  regularPrice: number
  discount: number
  image: string | File
  description: string
}

async function resolveImage(cabin: CabinData, cabinId?: number) {
  if (typeof cabin.image === 'string') return cabin.image
  if (!cabinId) throw new Error('An image URL is required to create a cabin')
  const updated = await api.uploadCabinImage(cabinId, cabin.image)
  return updated.image ?? ''
}

export function useCreateCabin() {
  const queryClient = useQueryClient()

  const { mutate: createCabin, isPending: isCreating } = useMutation({
    mutationFn: async (newCabin: CabinData) => {
      if (newCabin.image instanceof File) {
        // Create the cabin first with an empty image, then upload through the
        // authenticated API which owns storage permissions.
        const created = await api.createCabin({ ...newCabin, image: '' })
        const image = await resolveImage(newCabin, created.id)
        return api.updateCabin(created.id, { image })
      }
      return api.createCabin(newCabin as CabinData & { image: string })
    },
    onSuccess: () => {
      toast.success('Cabin created successfully')
      queryClient.invalidateQueries({ queryKey: ['cabins'] })
    },
    onError: (err: Error) => {
      console.error(err)
      toast.error(err.message)
    },
  })

  return { createCabin, isCreating }
}
