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
