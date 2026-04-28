import { supabase } from './supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  username: string
  email: string
  created_at: string
}

let inMemoryUser: User | null = null

export function mapSupabaseUser(authUser: SupabaseUser): User {
  return {
    id: authUser.id,
    username:
      authUser.user_metadata?.username ||
      authUser.email?.split('@')[0] ||
      'User',
    email: authUser.email ?? '',
    created_at: authUser.created_at,
  }
}

export const initUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  inMemoryUser = user ? mapSupabaseUser(user) : null
  return inMemoryUser
}

export const getUser = (): User | null => inMemoryUser

export const setUser = (user: User): void => {
  inMemoryUser = user
}

export const removeUser = (): void => {
  inMemoryUser = null
}

/** Returns the Supabase access token (used for Storage uploads). */
export const getToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** Quick sync cookie check — middleware handles the real server-side guard. */
const hasAuthCookie = (): boolean => {
  if (typeof document === 'undefined') return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const ref = url.split('//')[1]?.split('.')[0] ?? ''
  return ref !== '' && document.cookie.includes(`sb-${ref}-auth-token`)
}

export const isAuthenticated = (): boolean =>
  !!inMemoryUser || hasAuthCookie()

export const logout = async (): Promise<void> => {
  inMemoryUser = null
  await supabase.auth.signOut()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export const requireAuth = (): boolean => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return false
  }
  return true
}

export const redirectIfAuth = (router: {
  replace: (path: string) => void
}): void => {
  if (isAuthenticated()) {
    router.replace('/dashboard')
  }
}

// Legacy no-op — Supabase manages session cookies automatically.
export const setToken = (_token: string): void => {}
export const removeToken = (): void => {}
