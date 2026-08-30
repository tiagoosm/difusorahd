// sessionStorage: doesn't repeat the pop-up in the same browser session
// after the user has already seen/closed it once, but shows up again in a
// new session. localStorage: after a successful registration, the pop-up
// never shows up automatically again (not even in future sessions) —
// someone who already registered doesn't need to be invited again. Both
// wrapped in try/catch: some browsers in private mode throw when writing
// to storage.
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
    // Ignored on purpose: worst case, the pop-up shows up again.
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
    // Ignored on purpose: worst case, the pop-up shows up again.
  }
}
