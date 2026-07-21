'use client'

import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { RefreshCw, Trash2 } from 'lucide-react'
import { deleteShot } from '@/lib/actions/shot-actions'
import type { ShotPublic } from '@/lib/types'

interface ShotCardProps {
  shot: ShotPublic
  index: number
  onRegenerate: (shotId: string) => void
  onDeleted: (shotId: string) => void
  isRegenerating: boolean
}

export function ShotCard({ shot, index, onRegenerate, onDeleted, isRegenerating }: ShotCardProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this shot?')) return
    setDeleting(true)
    await deleteShot(shot.id)
    onDeleted(shot.id)
  }

  return (
    <Draggable draggableId={shot.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition ${
            snapshot.isDragging ? 'border-blue-400 shadow-md rotate-1' : 'border-gray-200'
          } ${isRegenerating || deleting ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {/* Image area */}
          <div className="relative aspect-video bg-gray-100">
            {shot.image_url ? (
              <img
                src={shot.image_url}
                alt={`Shot ${shot.shot_number}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
            <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white">
              #{shot.shot_number}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-1 p-3">
            <div className="flex flex-wrap gap-1">
              {[shot.angle, shot.framing, shot.movement].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs font-medium text-gray-700">
              Mood: <span className="font-normal">{shot.mood}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1 border-t border-gray-100 px-3 py-2">
            <button
              onClick={() => onRegenerate(shot.id)}
              disabled={isRegenerating}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
