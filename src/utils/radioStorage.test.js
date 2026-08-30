import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredRadioVolume,
  storeRadioVolume,
  getStoredRadioMuted,
  storeRadioMuted,
  DEFAULT_RADIO_VOLUME,
} from './radioStorage'

describe('radioStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to DEFAULT_RADIO_VOLUME and not muted when nothing was stored yet', () => {
    expect(getStoredRadioVolume()).toBe(DEFAULT_RADIO_VOLUME)
    expect(getStoredRadioMuted()).toBe(false)
  })

  it('persists and reads back the volume', () => {
    storeRadioVolume(0.35)
    expect(getStoredRadioVolume()).toBe(0.35)
  })

  it('falls back to the default for a corrupted/out-of-range stored volume', () => {
    localStorage.setItem('difusora_radio_volume', 'not-a-number')
    expect(getStoredRadioVolume()).toBe(DEFAULT_RADIO_VOLUME)

    localStorage.setItem('difusora_radio_volume', '5')
    expect(getStoredRadioVolume()).toBe(DEFAULT_RADIO_VOLUME)
  })

  it('persists and reads back muted', () => {
    storeRadioMuted(true)
    expect(getStoredRadioMuted()).toBe(true)

    storeRadioMuted(false)
    expect(getStoredRadioMuted()).toBe(false)
  })
})
