import { createClient } from '@supabase/supabase-js'
import { getRequiredServerEnv } from '@/lib/env'

// Service client — bypasses RLS for trusted server writes only
// Never import this file from any client component
export function getSupabaseServiceClient() {
  return createClient(
    getRequiredServerEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredServerEnv('SUPABASE_SECRET_KEY')
  )
}
