import { supabase } from '../integrations/supabase'

export async function signup({
  fullName,
  email,
  password,
}: {
  fullName: string
  email: string
  password: string
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
      },
    },
  })
  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    throw new Error(error.message)
  }

  return data
}

// The application profile carries the role used by the admin API. It is read
// from the profiles table under RLS (self read), never from client storage.
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // A missing profile means the account was never provisioned; surface the
    // reason instead of silently treating an administrator as a guest.
    console.warn(
      'profile lookup failed, falling back to guest role:',
      profileError?.code ?? 'PGRST116',
      profileError?.message ?? 'no profile row',
    )
    return { ...user, role: 'guest' as const }
  }

  return { ...user, role: profile.role as 'guest' | 'admin' }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

// Auth-level profile data only (name and password). Cabin images and other
// business resources are uploaded through the authenticated admin API.
export async function updateCurrentUser({
  password,
  fullName,
}: {
  password?: string
  fullName?: string
}) {
  let updateData: { password?: string; data?: { full_name: string } }
  if (password && fullName) {
    updateData = { password, data: { full_name: fullName } }
  } else if (password) {
    updateData = { password }
  } else if (fullName) {
    updateData = { data: { full_name: fullName } }
  } else {
    return { user: null }
  }

  const { data, error } = await supabase.auth.updateUser(updateData)
  if (error) throw new Error(error.message)
  return data
}
