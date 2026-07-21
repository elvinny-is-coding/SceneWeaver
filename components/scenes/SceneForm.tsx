// Library: shadcn/ui
// Path: components/scenes/SceneForm.tsx

'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { ScriptEditor } from '@/components/editor/ScriptEditor'
import { createScene } from '@/lib/actions/scene-actions'
import { Loader2 } from 'lucide-react'
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
    <Card>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="scene-title" className="text-sm font-medium text-foreground">
              Scene title
            </label>
            <Input
              id="scene-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Act 1 — Opening"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Scene script
            </label>
            <ScriptEditor
              value={script}
              onChange={setScript}
              placeholder="Describe what happens in this scene…"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add scene
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
