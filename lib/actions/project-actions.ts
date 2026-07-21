'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import type { ActionResult, ProjectRow } from '@/lib/types'

function sanitizeTitle(raw: string): string {
  return raw.trim().slice(0, 200).replace(/<[^>]*>/g, '')
}

export async function createProject(title: string): Promise<ActionResult<ProjectRow>> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const clean = sanitizeTitle(title)
  if (!clean) return { success: false, error: 'Title is required' }

  const service = getSupabaseServiceClient()
  const { data, error } = await service
    .from('projects')
    .insert({ user_id: user.id, title: clean })
    .select()
    .single()

  if (error || !data) return { success: false, error: 'Failed to create project' }
  revalidatePath('/dashboard')
  return { success: true, data: data as ProjectRow }
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // RLS on the anon client ensures the user owns this project
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) return { success: false, error: 'Failed to delete project' }

  revalidatePath('/dashboard')
  return { success: true }
}
