// Canonical shot shape as stored in the database (server-only)
export interface ShotRow {
  id: string
  scene_id: string
  shot_number: number
  angle: string
  framing: string
  movement: string
  mood: string
  visual_prompt: string // never passed to client components
  image_url: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// Client-safe shape — visual_prompt structurally absent
export type ShotPublic = Omit<ShotRow, 'visual_prompt'>

// Strip visual_prompt at the server-component boundary
export function toPublicShot(row: ShotRow): ShotPublic {
  const { visual_prompt: _stripped, ...pub } = row
  return pub
}

export interface SceneRow {
  id: string
  project_id: string
  title: string
  script: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ContinuityContext {
  location: string
  time_of_day: string
  lighting_direction: string
}

// Server Action return shape
export interface ActionResult<T = undefined> {
  success: boolean
  error?: string
  data?: T
}

// Reorder payload for drag-and-drop persistence
export interface ReorderItem {
  id: string
  order_index: number
}
