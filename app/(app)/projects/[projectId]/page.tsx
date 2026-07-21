import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SceneList } from '@/components/scenes/SceneList'
import type { SceneRow } from '@/lib/types'
import Link from 'next/link'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params
  const supabase = await getSupabaseServerClient()

  const { data: project } = await supabase
    .from('projects').select('*').eq('id', projectId).single()
  if (!project) notFound()

  const { data: scenes } = await supabase
    .from('scenes').select('*').eq('project_id', projectId)
    .order('order_index', { ascending: true })

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{project.title}</span>
      </div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">{project.title}</h1>
      <SceneList
        projectId={projectId}
        initialScenes={(scenes ?? []) as SceneRow[]}
      />
    </div>
  )
}
