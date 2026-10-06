import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Without `globals: true` in vite.config.js, Testing Library's automatic
// cleanup doesn't register itself — without this, one test's DOM leaks
// into the next within the same file (screen.getByRole finds duplicate
// elements from previous renders).
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement layout, so Range has no real client rects —
// ProseMirror (the Editor/Tiptap component) calls these when it scrolls
// the selection into view on focus, and throws without them.
if (typeof Range !== 'undefined') {
  Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} })
  Range.prototype.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })
}
