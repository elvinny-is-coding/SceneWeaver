import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-base font-bold text-gray-900">
            SceneWeaver
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
