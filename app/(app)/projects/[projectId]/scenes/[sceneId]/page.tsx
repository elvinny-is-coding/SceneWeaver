import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Board } from '@/components/board/Board'
import { toPublicShot } from '@/lib/types'
import type { ShotRow, SceneRow } from '@/lib/types'
import Link from 'next/link'

interface Props {
  params: Promise<{ projectId: string; sceneId: string }>
}

export default async function SceneBoardPage({ params }: Props) {
  const { projectId, sceneId } = await params
  const supabase = await getSupabaseServerClient()

  const { data: scene } = await supabase
    .from('scenes').select('*').eq('id', sceneId).single()
  if (!scene) notFound()

  const { data: project } = await supabase
    .from('projects').select('title').eq('id', projectId).single()

  // Fetch full rows including visual_prompt
  const { data: shotRows } = await supabase
    .from('shots').select('*').eq('scene_id', sceneId)
    .order('order_index', { ascending: true })

  // ── visual_prompt firewall: strip before passing to any Client Component ──
  const publicShots = ((shotRows ?? []) as ShotRow[]).map(toPublicShot)

  const sceneData = scene as SceneRow

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <span>/</span>
        <Link href={`/projects/${projectId}`} className="hover:text-gray-900">
          {project?.title ?? 'Project'}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{sceneData.title}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{sceneData.title}</h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{sceneData.script}</p>
      </div>

      {/* Board receives ShotPublic[] — visual_prompt absent */}
      <Board
        initialShots={publicShots}
        sceneId={sceneId}
        sceneScript={sceneData.script}
        sceneName={sceneData.title}
      />
    </div>
  )
}
