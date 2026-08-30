// Só volume/mudo persistem entre sessões — nunca "estava tocando", porque
// autoplay com som é bloqueado pelos navegadores sem gesto do usuário
// (retomar sozinho ao abrir o site não funcionaria mesmo se guardássemos
// esse estado). Tudo em try/catch: modo privado pode lançar erro ao gravar.
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
    // Ignorado de propósito: na pior hipótese o volume salvo não persiste.
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
    // Ignorado de propósito.
  }
}
