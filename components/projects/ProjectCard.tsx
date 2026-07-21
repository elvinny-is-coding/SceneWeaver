// Library: shadcn/ui
// Path: components/projects/ProjectCard.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteProject } from '@/lib/actions/project-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import type { ProjectRow } from '@/lib/types'

interface ProjectCardProps {
  project: ProjectRow
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this project and all its scenes?')) return
    setDeleting(true)
    await deleteProject(project.id)
  }

  return (
    <Card
      onClick={() => router.push(`/projects/${project.id}`)}
      className="group relative cursor-pointer transition hover:ring-primary/40"
    >
      <div className="px-5 py-5">
        <h3 className="truncate pr-8 font-semibold text-foreground">{project.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(project.created_at).toLocaleDateString()}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="absolute right-2 top-2 hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex disabled:opacity-40"
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
