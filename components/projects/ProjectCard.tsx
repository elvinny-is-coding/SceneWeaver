'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteProject } from '@/lib/actions/project-actions'
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
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
    >
      <h3 className="font-semibold text-gray-900 truncate pr-8">{project.title}</h3>
      <p className="mt-1 text-xs text-gray-400">
        {new Date(project.created_at).toLocaleDateString()}
      </p>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute right-3 top-3 hidden rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 group-hover:flex disabled:opacity-40"
        aria-label="Delete project"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
