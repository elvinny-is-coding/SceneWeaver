// Library: Tiptap
// Path: components/editor/ScriptEditor.tsx

'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Card, CardContent } from '@/components/ui/card'
import { EditorToolbar } from './EditorToolbar'
import { SceneHeading } from './extensions/SceneHeading'
import { Action } from './extensions/Action'
import { Character } from './extensions/Character'
import { Dialogue } from './extensions/Dialogue'
import { Parenthetical } from './extensions/Parenthetical'
import { Transition } from './extensions/Transition'

interface ScriptEditorProps {
  value: string
  onChange: (json: string) => void
  placeholder?: string
}

const CHARACTER_LIMIT = 2000

export function ScriptEditor({ value, onChange, placeholder = 'Start writing…' }: ScriptEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: CHARACTER_LIMIT }),
      SceneHeading,
      Action,
      Character,
      Dialogue,
      Parenthetical,
      Transition,
    ],
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  // Restore persisted content on mount
  useEffect(() => {
    if (!editor || !value) return
    try {
      const parsed = JSON.parse(value)
      editor.commands.setContent(parsed)
    } catch {
      // value is not valid JSON — leave editor empty
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  const count = editor ? editor.storage.characterCount.characters() : 0

  return (
    <Card className="dark:bg-card">
      <EditorToolbar editor={editor} />
      <CardContent className="p-0">
        <EditorContent editor={editor} />
      </CardContent>
      <div className="px-3 pb-2 text-right text-xs text-muted-foreground">
        {count}/{CHARACTER_LIMIT}
      </div>
    </Card>
  )
}
