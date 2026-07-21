// Library: Tiptap
// Path: components/editor/extensions/Character.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const Character = Node.create({
  name: 'character',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'p[data-type="character"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { 'data-type': 'character', class: 'screenplay-character' }), 0]
  },
})
