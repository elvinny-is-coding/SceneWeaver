'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { createScene } from '@/lib/actions/scene-actions'
import type { SceneRow } from '@/lib/types'

interface SceneFormProps {
  projectId: string
  onCreated: (scene: SceneRow) => void
  onCancel: () => void
}

export function SceneForm({ projectId, onCreated, onCancel }: SceneFormProps) {
  const [title, setTitle] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createScene(projectId, title, script)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Unknown error')
      return
    }
    onCreated(result.data!)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <Input
        id="scene-title"
        label="Scene title"
        type="text"
        required
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Act 1 — Opening"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="scene-script" className="text-sm font-medium text-gray-700">
          Scene script
        </label>
        <textarea
          id="scene-script"
          required
          maxLength={2000}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={4}
          placeholder="Describe what happens in this scene…"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-right text-xs text-gray-400">{script.length}/2000</p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>
          Add scene
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
