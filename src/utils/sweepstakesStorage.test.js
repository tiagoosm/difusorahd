import { describe, it, expect, beforeEach } from 'vitest'
import {
  hasSeenSweepstakesPopup,
  markSweepstakesPopupSeen,
  hasRegisteredForSweepstakes,
  markRegisteredForSweepstakes,
} from './sweepstakesStorage'

describe('sweepstakesStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('has not seen the popup and has not registered by default', () => {
    expect(hasSeenSweepstakesPopup()).toBe(false)
    expect(hasRegisteredForSweepstakes()).toBe(false)
  })

  it('marks the popup as seen in sessionStorage (not localStorage)', () => {
    markSweepstakesPopupSeen()
    expect(hasSeenSweepstakesPopup()).toBe(true)
    expect(localStorage.getItem('difusora_sweepstakes_popup_seen')).toBeNull()
  })

  it('marks registration in localStorage (survives across sessions)', () => {
    markRegisteredForSweepstakes()
    expect(hasRegisteredForSweepstakes()).toBe(true)
    expect(sessionStorage.getItem('difusora_sweepstakes_registered')).toBeNull()
  })
})
