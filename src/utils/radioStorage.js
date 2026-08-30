// Only volume/muted persist across sessions — never "was playing", because
// autoplay with sound is blocked by browsers without a user gesture
// (resuming on its own when the site opens wouldn't work even if we stored
// that state). Everything wrapped in try/catch: private mode can throw when writing.
const VOLUME_KEY = 'difusora_radio_volume'
const MUTED_KEY = 'difusora_radio_muted'
export const DEFAULT_RADIO_VOLUME = 0.8

export function getStoredRadioVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_KEY)
    const parsed = raw === null ? NaN : Number(raw)
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : DEFAULT_RADIO_VOLUME
  } catch {
    return DEFAULT_RADIO_VOLUME
  }
}

export function storeRadioVolume(volume) {
  try {
    localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    // Ignored on purpose: worst case, the saved volume doesn't persist.
  }
}

export function getStoredRadioMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

export function storeRadioMuted(muted) {
  try {
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
  } catch {
    // Ignored on purpose.
  }
}
