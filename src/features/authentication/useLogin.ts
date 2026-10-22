import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { getCurrentUser, login as loginApi } from '../../services/apiAuth'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutate: login, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi({ email, password }),
    onSuccess: async () => {
      // The auth session only carries the Supabase user; the application
      // profile (and with it the role) has to be loaded separately. Fetching it
      // before the redirect prevents the guard from seeing an incomplete user.
      await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
      })
      navigate('/dashboard', { replace: true })
    },
    onError: error => {
      console.error(error.message)
      toast.error('Provided email or password are incorrect')
    },
  })

  return { login, isPending }
}
