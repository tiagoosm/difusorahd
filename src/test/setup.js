import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Sem `globals: true` no vite.config.js, o cleanup automático do Testing
// Library não se registra sozinho — sem isso, o DOM de um teste vaza pro
// próximo dentro do mesmo arquivo (screen.getByRole encontra elementos
// duplicados de renders anteriores).
afterEach(() => {
  cleanup()
})
