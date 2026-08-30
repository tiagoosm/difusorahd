import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLiveRadio } from './useLiveRadio'

// A real <audio> element (jsdom) doesn't actually play or fire the events
// the hook listens to in a controllable way — a fake EventTarget, with
// play()/pause() mockable per test, makes the reconnect/backoff
// deterministic under fake timers.
class FakeAudio extends EventTarget {
  constructor() {
    super()
    this.paused = true
    this.volume = 1
    this.muted = false
    this.src = ''
    instances.push(this)
  }

  play = vi.fn(() => {
    this.paused = false
    return Promise.resolve()
  })

  pause() {
    this.paused = true
  }

  load() {}
  removeAttribute() {}
}

let instances = []

function lastAudio() {
  return instances[instances.length - 1]
}

beforeEach(() => {
  instances = []
  localStorage.clear()
  vi.stubGlobal('Audio', FakeAudio)
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useLiveRadio — estado inicial', () => {
  it('starts idle, not playing/loading, ready to play', () => {
    const { result } = renderHook(() => useLiveRadio())

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.statusText).toBe('Pronto para tocar')
    expect(result.current.showRetry).toBe(false)
  })
})

describe('useLiveRadio — play/stop', () => {
  it('enters a loading/connecting state as soon as play() is called', () => {
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.play())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.statusText).toBe('Conectando…')
    expect(lastAudio().play).toHaveBeenCalled()
  })

  it('becomes playing once the audio element fires "playing"', () => {
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.play())
    act(() => lastAudio().dispatchEvent(new Event('playing')))

    expect(result.current.isPlaying).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.statusText).toBe('Ao vivo agora')
  })

  it('stop() pauses the stream and resets to the idle status', () => {
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.play())
    act(() => lastAudio().dispatchEvent(new Event('playing')))
    act(() => result.current.stop())

    expect(result.current.isPlaying).toBe(false)
    expect(lastAudio().paused).toBe(true)
    expect(result.current.statusText).toBe('Pronto para tocar')
  })
})

describe('useLiveRadio — reconexão em backoff', () => {
  it('schedules a reconnect with increasing status count after a stream error', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.play())
    act(() => lastAudio().dispatchEvent(new Event('playing')))
    act(() => lastAudio().dispatchEvent(new Event('error')))

    expect(result.current.statusText).toBe('Reconectando… (1/5)')
    expect(result.current.isLoading).toBe(true)
  })

  it('gives up after 5 attempts and shows the retry button', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.play())

    // Each "error" increments the attempt counter (checked BEFORE
    // incrementing) — the first 5 still schedule a new reconnect; only the
    // 6th triggers giving up (counter already at 5 = MAX_ATTEMPTS). Advances
    // the clock past the longest delay (1.5s * 2^4 = 24s) between each one
    // to fire the backoff's next setTimeout.
    for (let i = 0; i < 6; i++) {
      act(() => lastAudio().dispatchEvent(new Event('error')))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(25000)
      })
    }

    expect(result.current.statusText).toBe('Falha ao conectar')
    expect(result.current.showRetry).toBe(true)
    expect(result.current.isPlaying).toBe(false)
  })

  it('does not try to reconnect after the user explicitly stopped the stream', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.play())
    act(() => lastAudio().dispatchEvent(new Event('playing')))
    act(() => result.current.stop())
    act(() => lastAudio().dispatchEvent(new Event('error')))

    expect(result.current.statusText).toBe('Pronto para tocar')
    expect(result.current.showRetry).toBe(false)
  })
})

describe('useLiveRadio — volume', () => {
  it('setVolume updates the audio element and clamps out-of-range values', () => {
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.setVolume(0.4))
    expect(result.current.volume).toBe(0.4)
    expect(lastAudio().volume).toBe(0.4)

    act(() => result.current.setVolume(5))
    expect(result.current.volume).toBe(1)
  })

  it('toggleMute mutes and restores the previous volume', () => {
    const { result } = renderHook(() => useLiveRadio())

    act(() => result.current.setVolume(0.6))
    act(() => result.current.toggleMute())
    expect(result.current.isMuted).toBe(true)
    expect(lastAudio().muted).toBe(true)

    act(() => result.current.toggleMute())
    expect(result.current.isMuted).toBe(false)
    expect(lastAudio().volume).toBe(0.6)
  })
})
