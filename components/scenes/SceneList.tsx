'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Trash2, Plus } from 'lucide-react'
import { deleteScene } from '@/lib/actions/scene-actions'
import { SceneForm } from './SceneForm'
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
        <p className="text-sm text-gray-500">No scenes yet. Add one below.</p>
      )}

      {scenes.map((scene) => (
        <div
          key={scene.id}
          className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <button
            onClick={() => router.push(`/projects/${projectId}/scenes/${scene.id}`)}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{scene.title}</p>
              <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{scene.script}</p>
            </div>
          </button>
          <button
            onClick={() => handleDelete(scene.id)}
            className="ml-3 hidden rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 group-hover:block"
            aria-label="Delete scene"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {showForm ? (
        <SceneForm
          projectId={projectId}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add scene
        </button>
      )}
    </div>
  )
}
