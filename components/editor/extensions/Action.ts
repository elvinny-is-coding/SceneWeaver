// Library: Tiptap
// Path: components/editor/extensions/Action.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const Action = Node.create({
  name: 'action',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'p[data-type="action"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { 'data-type': 'action', class: 'screenplay-action' }), 0]
  },
})
