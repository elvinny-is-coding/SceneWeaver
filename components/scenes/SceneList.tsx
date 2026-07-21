// Library: shadcn/ui
// Path: components/scenes/SceneList.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Trash2, Plus } from 'lucide-react'
import { deleteScene } from '@/lib/actions/scene-actions'
import { SceneForm } from './SceneForm'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import type { SceneRow } from '@/lib/types'

interface SceneListProps {
  projectId: string
  initialScenes: SceneRow[]
}

export function SceneList({ projectId, initialScenes }: SceneListProps) {
  const router = useRouter()
  const [scenes, setScenes] = useState<SceneRow[]>(initialScenes)
  const [showForm, setShowForm] = useState(false)

  function handleCreated(scene: SceneRow) {
    setScenes((prev) => [...prev, scene])
    setShowForm(false)
  }

  async function handleDelete(sceneId: string) {
    if (!confirm('Delete this scene and all its shots?')) return
    await deleteScene(sceneId, projectId)
    setScenes((prev) => prev.filter((s) => s.id !== sceneId))
  }

  return (
    <div className="flex flex-col gap-3">
      {scenes.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">No scenes yet. Add one below.</p>
      )}

      {scenes.map((scene) => (
        <Card key={scene.id} className="group">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.push(`/projects/${projectId}/scenes/${scene.id}`)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{scene.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{scene.script}</p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(scene.id)}
              className="ml-3 hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
              aria-label="Delete scene"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      {showForm ? (
        <SceneForm
          projectId={projectId}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 border-dashed text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add scene
        </Button>
      )}
    </div>
  )
}
