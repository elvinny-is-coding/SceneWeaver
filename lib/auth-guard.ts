import { getSupabaseServerClient } from '@/lib/supabase/server'

// Returns the authenticated user or null. Used as the first guard in every API route.
export async function requireAuth() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null, error: 'UNAUTHORIZED' } as const
  }
  return { user, error: null } as const
}
