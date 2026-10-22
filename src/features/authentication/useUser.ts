import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../../services/apiAuth'

export function useUser() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    // The role decides what the guard renders, so never serve it from a stale
    // cache: revalidate whenever the guard mounts.
    staleTime: 0,
  })

  return {
    user,
    isLoading,
    refetch,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
  }
}
