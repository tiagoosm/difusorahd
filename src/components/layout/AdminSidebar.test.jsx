import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// Same reasoning as FooterNavigation.test.jsx: NAV_ITEMS is built once at
// module load, so each test mocks the flag and re-imports the module fresh.
describe('AdminSidebar — sweepstakes feature flag', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('hides the "Sorteio" nav item while the flag is off (current default)', async () => {
    vi.doMock('../../config/features', () => ({ SWEEPSTAKES_ENABLED: false }))
    const { default: AdminSidebar } = await import('./AdminSidebar')

    renderWithRouter(<AdminSidebar isOpen onClose={() => {}} />)

    expect(screen.queryByText('Sorteio')).not.toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Anúncios')).toBeInTheDocument()
  })

  it('shows the "Sorteio" nav item again once the flag is turned back on', async () => {
    vi.doMock('../../config/features', () => ({ SWEEPSTAKES_ENABLED: true }))
    const { default: AdminSidebar } = await import('./AdminSidebar')

    renderWithRouter(<AdminSidebar isOpen onClose={() => {}} />)

    expect(screen.getByText('Sorteio')).toBeInTheDocument()
  })
})
