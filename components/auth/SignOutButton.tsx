// Library: shadcn/ui
// Path: components/auth/SignOutButton.tsx

'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  )
}
