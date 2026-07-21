'use client'

import { ProjectCard } from './ProjectCard'
import type { ProjectRow } from '@/lib/types'

interface ProjectGridProps {
  projects: ProjectRow[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No projects yet.{' '}
        <a href="/projects/new" className="text-blue-600 hover:underline">
          Create your first project.
        </a>
      </p>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  )
}
