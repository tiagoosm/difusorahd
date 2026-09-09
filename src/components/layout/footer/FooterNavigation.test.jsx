import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// SWEEPSTAKES_ENABLED is read once, at module load, into the top-level
// LINKS array — vi.doMock + a fresh dynamic import per test (instead of
// mutating the mock after import) is what lets each test see its own value.
describe('FooterNavigation — sweepstakes feature flag', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('hides "Participe do sorteio" while the flag is off (current default)', async () => {
    vi.doMock('../../../config/features', () => ({ SWEEPSTAKES_ENABLED: false }))
    const { default: FooterNavigation } = await import('./FooterNavigation')

    renderWithRouter(<FooterNavigation />)

    expect(screen.queryByText('Participe do sorteio')).not.toBeInTheDocument()
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Buscar notícias')).toBeInTheDocument()
  })

  it('shows "Participe do sorteio" again once the flag is turned back on', async () => {
    vi.doMock('../../../config/features', () => ({ SWEEPSTAKES_ENABLED: true }))
    const { default: FooterNavigation } = await import('./FooterNavigation')

    renderWithRouter(<FooterNavigation />)

    expect(screen.getByText('Participe do sorteio')).toBeInTheDocument()
  })
})
