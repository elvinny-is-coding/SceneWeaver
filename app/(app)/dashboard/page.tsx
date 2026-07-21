// Library: shadcn/ui
// Path: app/(app)/dashboard/page.tsx

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import type { ProjectRow } from '@/lib/types'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — SceneWeaver' }

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) redirect('/login')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Your projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          New project
        </Link>
      </div>
      <ProjectGrid projects={(projects ?? []) as ProjectRow[]} />
    </div>
  )
}
