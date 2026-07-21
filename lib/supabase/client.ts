'use client'

import { createBrowserClient } from '@supabase/ssr'

// Browser singleton — uses the publishable key (safe for client-side)
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
