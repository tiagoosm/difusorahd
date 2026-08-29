import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SweepstakesPopup from './SweepstakesPopup'

function renderPopup(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SweepstakesPopup />
    </MemoryRouter>,
  )
}

// act() (não waitFor) porque waitFor faz polling com setTimeout real, que
// trava para sempre sob fake timers sem ninguém avançando o relógio de
// novo — act() já flusha o setState disparado dentro do advanceTimersByTime.
function advance(ms) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('SweepstakesPopup', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not show immediately on mount', () => {
    renderPopup()
    expect(screen.queryByText('Participe do nosso sorteio!')).toBeNull()
  })

  it('shows automatically after the initial delay', () => {
    renderPopup()
    advance(1500)
    expect(screen.getByText('Participe do nosso sorteio!')).toBeInTheDocument()
  })

  // Regressão do requisito principal: fechar o pop-up não pode deixá-lo
  // reaparecendo a cada navegação/remontagem dentro da mesma sessão.
  it('does not reappear after being closed once, on a later mount in the same session', () => {
    const { unmount } = renderPopup()
    advance(1500)
    expect(screen.getByText('Participe do nosso sorteio!')).toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: 'Fechar' }).click()
    })
    expect(screen.queryByText('Participe do nosso sorteio!')).toBeNull()

    unmount()

    renderPopup()
    advance(5000)
    expect(screen.queryByText('Participe do nosso sorteio!')).toBeNull()
  })

  it('never shows once the visitor has already registered (localStorage)', () => {
    localStorage.setItem('difusora_sweepstakes_registered', '1')
    renderPopup()
    advance(5000)
    expect(screen.queryByText('Participe do nosso sorteio!')).toBeNull()
  })

  it('does not show while already on the registration page', () => {
    renderPopup('/sorteio')
    advance(5000)
    expect(screen.queryByText('Participe do nosso sorteio!')).toBeNull()
  })

  it('"Agora não" also suppresses the popup for the rest of the session', () => {
    const { unmount } = renderPopup()
    advance(1500)
    expect(screen.getByText('Participe do nosso sorteio!')).toBeInTheDocument()

    act(() => {
      screen.getByText('Agora não').click()
    })
    unmount()

    renderPopup()
    advance(5000)
    expect(screen.queryByText('Participe do nosso sorteio!')).toBeNull()
  })
})
