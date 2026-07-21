// Library: Tiptap
// Path: components/editor/extensions/Dialogue.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const Dialogue = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'p[data-type="dialogue"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { 'data-type': 'dialogue', class: 'screenplay-dialogue' }), 0]
  },
})
