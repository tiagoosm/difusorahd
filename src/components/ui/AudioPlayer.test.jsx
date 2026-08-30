import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AudioPlayer from './AudioPlayer'

// jsdom doesn't implement real media playback — without this, play()
// rejects with "not implemented" and the component would fall into the error state.
beforeEach(() => {
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  window.HTMLMediaElement.prototype.pause = vi.fn()
})

describe('AudioPlayer', () => {
  it('renders a play button and progress/volume controls', () => {
    render(<AudioPlayer src="https://example.com/audio.mp3" />)

    expect(screen.getByRole('button', { name: 'Reproduzir áudio' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Progresso do áudio' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
  })

  it('toggles to a pause button after play is clicked', async () => {
    render(<AudioPlayer src="https://example.com/audio.mp3" />)

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir áudio' }))

    expect(await screen.findByRole('button', { name: 'Pausar áudio' })).toBeInTheDocument()
  })

  it('falls back to a friendly error message when the audio fails to load', () => {
    render(<AudioPlayer src="https://example.com/broken.mp3" />)

    const audio = document.querySelector('audio')
    fireEvent.error(audio)

    expect(screen.getByText(/não foi possível reproduzir o áudio/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reproduzir áudio' })).not.toBeInTheDocument()
  })
})
