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
        <h1 className="text-xl font-semibold text-gray-900">Your projects</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New project
        </Link>
      </div>
      <ProjectGrid projects={(projects ?? []) as ProjectRow[]} />
    </div>
  )
}
