// Library: Tiptap
// Path: components/editor/EditorToolbar.tsx

'use client'

import type { Editor } from '@tiptap/react'
import { Toggle } from '@/components/ui/toggle'

interface EditorToolbarProps {
  editor: Editor | null
}

const SCREENPLAY_TYPES = [
  { label: 'Scene Heading', node: 'sceneHeading' },
  { label: 'Action',        node: 'action' },
  { label: 'Character',     node: 'character' },
  { label: 'Dialogue',      node: 'dialogue' },
  { label: 'Parenthetical', node: 'parenthetical' },
  { label: 'Transition',    node: 'transition' },
] as const

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 px-2 py-1.5 dark:bg-muted/20">
      {SCREENPLAY_TYPES.map(({ label, node }) => (
        <Toggle
          key={node}
          size="sm"
          variant="outline"
          pressed={editor.isActive(node)}
          onPressedChange={() => {
            editor.chain().focus().setNode(node).run()
          }}
          aria-label={label}
        >
          {label}
        </Toggle>
      ))}
    </div>
  )
}
