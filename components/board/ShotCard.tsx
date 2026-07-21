// Library: shadcn/ui
// Path: components/board/ShotCard.tsx

'use client'

import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { RefreshCw, Trash2 } from 'lucide-react'
import { deleteShot } from '@/lib/actions/shot-actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
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
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex flex-col overflow-hidden transition ${
            snapshot.isDragging ? 'ring-2 ring-primary shadow-md rotate-1' : ''
          } ${isRegenerating || deleting ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {/* Image area */}
          <div className="relative aspect-video bg-muted">
            {shot.image_url ? (
              <img
                src={shot.image_url}
                alt={`Shot ${shot.shot_number}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 bg-black/60 text-white hover:bg-black/60"
            >
              #{shot.shot_number}
            </Badge>
          </div>

          {/* Metadata */}
          <CardContent className="flex flex-col gap-1 py-3">
            <div className="flex flex-wrap gap-1">
              {[shot.angle, shot.framing, shot.movement].map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="mt-1 text-xs font-medium text-foreground">
              Mood: <span className="font-normal text-muted-foreground">{shot.mood}</span>
            </p>
          </CardContent>

          {/* Actions */}
          <div className="flex gap-1 border-t border-border px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRegenerate(shot.id)}
              disabled={isRegenerating}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </Card>
      )}
    </Draggable>
  )
}
