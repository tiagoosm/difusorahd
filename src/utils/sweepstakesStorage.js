// sessionStorage: não repete o pop-up na mesma sessão do navegador depois
// que o usuário já viu/fechou uma vez, mas volta a aparecer numa sessão
// nova. localStorage: depois de um cadastro bem-sucedido, o pop-up nunca
// mais aparece automaticamente (nem em sessões futuras) — quem já se
// cadastrou não precisa ser convidado de novo. Ambos em try/catch: alguns
// navegadores em modo privado lançam erro ao gravar em storage.
const POPUP_SEEN_KEY = 'difusora_sweepstakes_popup_seen'
const REGISTERED_KEY = 'difusora_sweepstakes_registered'

export function hasSeenSweepstakesPopup() {
  try {
    return sessionStorage.getItem(POPUP_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markSweepstakesPopupSeen() {
  try {
    sessionStorage.setItem(POPUP_SEEN_KEY, '1')
  } catch {
    // Ignorado de propósito: na pior hipótese o pop-up aparece de novo.
  }
}

export function hasRegisteredForSweepstakes() {
  try {
    return localStorage.getItem(REGISTERED_KEY) === '1'
  } catch {
    return false
  }
}

export function markRegisteredForSweepstakes() {
  try {
    localStorage.setItem(REGISTERED_KEY, '1')
  } catch {
    // Ignorado de propósito: na pior hipótese o pop-up aparece de novo.
  }
}
