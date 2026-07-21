'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseServiceClient } from '@/lib/supabase/service'
import type { ActionResult, ReorderItem } from '@/lib/types'

export async function reorderShots(items: ReorderItem[]): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const service = getSupabaseServiceClient()
  const { error } = await service.from('shots').upsert(
    items.map(({ id, order_index }) => ({ id, order_index })),
    { onConflict: 'id' }
  )
  if (error) return { success: false, error: 'Failed to reorder shots' }
  return { success: true }
}

export async function deleteShot(shotId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // RLS enforces ownership
  const { error } = await supabase.from('shots').delete().eq('id', shotId)
  if (error) return { success: false, error: 'Failed to delete shot' }
  return { success: true }
}
