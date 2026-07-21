import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getRequiredServerEnv } from '@/lib/env'

// Cookie-aware server client — uses the publishable key, respects RLS
export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getRequiredServerEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredServerEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  )
}
