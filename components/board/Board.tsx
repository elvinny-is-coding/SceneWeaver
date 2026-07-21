'use client'

import { useState, useRef } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { Wand2, Plus } from 'lucide-react'
import { ShotCard } from './ShotCard'
import { ShotCardSkeleton } from './ShotCardSkeleton'
import { PdfExportButton } from './PdfExportButton'
import { reorderShots } from '@/lib/actions/shot-actions'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { ShotPublic, ContinuityContext } from '@/lib/types'

interface BoardProps {
  initialShots: ShotPublic[]
  sceneId: string
  sceneScript: string
  sceneName: string
}

export function Board({ initialShots, sceneId, sceneScript, sceneName }: BoardProps) {
  const [shots, setShots] = useState<ShotPublic[]>(initialShots)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  // Build continuity context from current shots for a given end index
  function buildContinuity(upToIndex: number): ContinuityContext[] {
    return shots.slice(0, upToIndex).map((s) => ({
      location: s.angle,      // angle/framing used as proxy continuity fields
      time_of_day: s.mood,
      lighting_direction: s.framing,
    }))
  }

  async function generateImage(shotId: string): Promise<void> {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shot_id: shotId }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    setShots((prev) =>
      prev.map((s) => (s.id === shotId ? { ...s, image_url: url } : s))
    )
  }

  async function handleGenerate() {
    setError(null)
    setGeneratingAll(true)
    try {
      const res = await fetch('/api/generate-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: sceneId,
          script: sceneScript,
          continuity_context: buildContinuity(shots.length),
        }),
      })
      const json = await res.json() as { shots?: ShotPublic[]; error?: string }
      if (!res.ok || !json.shots) {
        setError(json.error ?? 'Generation failed')
        return
      }
      setShots((prev) => [...prev, ...json.shots!])
      // Generate images for the new shots sequentially
      for (const shot of json.shots) {
        await generateImage(shot.id)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setGeneratingAll(false)
    }
  }

  async function handleContinueScene() {
    setError(null)
    setGeneratingAll(true)
    try {
      const res = await fetch('/api/generate-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: sceneId,
          script: sceneScript,
          continuity_context: buildContinuity(shots.length), // pass all prior shots as context
        }),
      })
      const json = await res.json() as { shots?: ShotPublic[]; error?: string }
      if (!res.ok || !json.shots) {
        setError(json.error ?? 'Continue scene failed')
        return
      }
      setShots((prev) => [...prev, ...json.shots!])
      for (const shot of json.shots) {
        await generateImage(shot.id)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setGeneratingAll(false)
    }
  }

  async function handleRegenerate(shotId: string) {
    setError(null)
    setRegeneratingId(shotId)
    try {
      const shotIndex = shots.findIndex((s) => s.id === shotId)
      // Re-generate just the image for an existing shot
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shot_id: shotId }),
      })
      if (!res.ok) {
        setError('Image regeneration failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setShots((prev) =>
        prev.map((s) => (s.id === shotId ? { ...s, image_url: url } : s))
      )
      void shotIndex // used for continuity in future extension
    } catch {
      setError('Network error — please try again')
    } finally {
      setRegeneratingId(null)
    }
  }

  function handleDeleted(shotId: string) {
    setShots((prev) => prev.filter((s) => s.id !== shotId))
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const reordered = Array.from(shots)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setShots(reordered)
    void reorderShots(reordered.map((s, i) => ({ id: s.id, order_index: i })))
  }

  const skeletonCount = generatingAll ? 4 : 0

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={generatingAll || !!regeneratingId}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Wand2 className="h-4 w-4" />
          {generatingAll ? 'Generating…' : 'Generate shots'}
        </button>
        {shots.length > 0 && (
          <button
            onClick={handleContinueScene}
            disabled={generatingAll || !!regeneratingId}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Continue scene
          </button>
        )}
        {shots.length > 0 && (
          <PdfExportButton boardRef={boardRef} sceneName={sceneName} />
        )}
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal">
          {(provided) => (
            <div
              ref={(el) => {
                provided.innerRef(el)
                ;(boardRef as React.MutableRefObject<HTMLDivElement | null>).current = el
              }}
              {...provided.droppableProps}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {shots.map((shot, index) => (
                <div key={shot.id} className="w-56 shrink-0">
                  <ShotCard
                    shot={shot}
                    index={index}
                    onRegenerate={handleRegenerate}
                    onDeleted={handleDeleted}
                    isRegenerating={regeneratingId === shot.id}
                  />
                </div>
              ))}
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={`skel-${i}`} className="w-56 shrink-0">
                  <ShotCardSkeleton />
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {shots.length === 0 && !generatingAll && (
        <p className="text-sm text-gray-400">
          Click &quot;Generate shots&quot; to create a storyboard from your scene script.
        </p>
      )}
    </div>
  )
}
