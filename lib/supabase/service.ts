import { createClient } from '@supabase/supabase-js'

// Service client — bypasses RLS for trusted server writes only
// Never import this file from any client component
export function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}
