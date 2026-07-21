// Library: Tiptap
// Path: components/editor/extensions/Transition.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const Transition = Node.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'p[data-type="transition"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { 'data-type': 'transition', class: 'screenplay-transition' }), 0]
  },
})
