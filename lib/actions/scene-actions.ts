'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import type { ActionResult, SceneRow } from '@/lib/types'

function sanitizeText(raw: string, max: number): string {
  return raw.trim().slice(0, max).replace(/<[^>]*>/g, '')
}

export async function createScene(
  projectId: string,
  title: string,
  script: string
): Promise<ActionResult<SceneRow>> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Verify ownership via RLS
  const { data: project } = await supabase
    .from('projects').select('id').eq('id', projectId).single()
  if (!project) return { success: false, error: 'Project not found' }

  const cleanTitle = sanitizeText(title, 200)
  const cleanScript = sanitizeText(script, 2000)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  if (!cleanTitle) return { success: false, error: 'Title is required' }
  if (!cleanScript) return { success: false, error: 'Script is required' }

  // Get max order_index for this project
  const { data: existing } = await supabase
    .from('scenes').select('order_index').eq('project_id', projectId)
    .order('order_index', { ascending: false }).limit(1)
  const orderIndex = (existing?.[0]?.order_index ?? -1) + 1

  const service = getSupabaseServiceClient()
  const { data, error } = await service
    .from('scenes')
    .insert({ project_id: projectId, title: cleanTitle, script: cleanScript, order_index: orderIndex })
    .select()
    .single()

  if (error || !data) return { success: false, error: 'Failed to create scene' }
  revalidatePath(`/projects/${projectId}`)
  return { success: true, data: data as SceneRow }
}

export async function deleteScene(
  sceneId: string,
  projectId: string
): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('scenes').delete().eq('id', sceneId)
  if (error) return { success: false, error: 'Failed to delete scene' }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
