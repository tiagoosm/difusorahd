import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RadioBar from './RadioBar'

const playMock = vi.fn()
const stopMock = vi.fn()
const retryMock = vi.fn()
const setVolumeMock = vi.fn()
const toggleMuteMock = vi.fn()

let hookState

vi.mock('../../hooks/useLiveRadio', () => ({
  useLiveRadio: () => hookState,
}))

function baseState(overrides = {}) {
  return {
    isPlaying: false,
    isLoading: false,
    statusText: 'Pronto para tocar',
    statusMode: null,
    showRetry: false,
    volume: 0.8,
    isMuted: false,
    play: playMock,
    stop: stopMock,
    retry: retryMock,
    setVolume: setVolumeMock,
    toggleMute: toggleMuteMock,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  hookState = baseState()
})

describe('RadioBar — recolhido por padrão', () => {
  it('shows only the collapsed pill (play button + "Ao vivo"), no expanded panel', () => {
    render(<RadioBar />)

    expect(screen.getByRole('button', { name: 'Tocar rádio ao vivo' })).toBeInTheDocument()
    expect(screen.getByText('Ao vivo')).toBeInTheDocument()
    expect(screen.queryByText('Rádio Difusora HD')).not.toBeInTheDocument()
  })

  it('clicking the play button calls play(), without needing to expand first', () => {
    render(<RadioBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Tocar rádio ao vivo' }))

    expect(playMock).toHaveBeenCalledTimes(1)
  })
})

describe('RadioBar — tocando', () => {
  it('shows "No ar" and a stop control once playing', () => {
    hookState = baseState({ isPlaying: true, statusText: 'Ao vivo agora' })
    render(<RadioBar />)

    expect(screen.getByText('No ar')).toBeInTheDocument()
    const stopButton = screen.getByRole('button', { name: 'Parar rádio ao vivo' })
    expect(stopButton).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(stopButton)
    expect(stopMock).toHaveBeenCalledTimes(1)
  })
})

describe('RadioBar — painel expandido', () => {
  it('opens the panel (station name, status, volume) when the label is clicked', () => {
    render(<RadioBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir player da rádio ao vivo' }))

    expect(screen.getByText('Rádio Difusora HD')).toBeInTheDocument()
    expect(screen.getByText('Pronto para tocar')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
  })

  it('does not show a retry button when showRetry is false', () => {
    render(<RadioBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir player da rádio ao vivo' }))

    expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument()
  })

  it('shows a retry button that calls retry() when the stream gave up reconnecting', () => {
    hookState = baseState({ statusText: 'Falha ao conectar', statusMode: 'error', showRetry: true })
    render(<RadioBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir player da rádio ao vivo' }))

    fireEvent.click(screen.getByText('Tentar novamente'))
    expect(retryMock).toHaveBeenCalledTimes(1)
  })

  it('changing the volume slider calls setVolume with a number', () => {
    render(<RadioBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir player da rádio ao vivo' }))

    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: '0.3' } })
    expect(setVolumeMock).toHaveBeenCalledWith(0.3)
  })

  it('clicking the mute button calls toggleMute()', () => {
    render(<RadioBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir player da rádio ao vivo' }))

    fireEvent.click(screen.getByRole('button', { name: 'Silenciar' }))
    expect(toggleMuteMock).toHaveBeenCalledTimes(1)
  })
})
