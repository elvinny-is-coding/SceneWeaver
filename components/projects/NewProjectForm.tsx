'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions/project-actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

export function NewProjectForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createProject(title)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Unknown error')
      return
    }
    router.push(`/projects/${result.data!.id}`)
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">New project</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <Input
          id="title"
          label="Project title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My short film"
        />
        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Create project
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
