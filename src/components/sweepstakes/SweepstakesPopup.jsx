import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Gift, X } from 'lucide-react'
import { ROUTES } from '../../routes/paths'
import {
  hasSeenSweepstakesPopup,
  markSweepstakesPopupSeen,
  hasRegisteredForSweepstakes,
} from '../../utils/sweepstakesStorage'

const SHOW_DELAY_MS = 1200

// Automatic invitation to the sweepstakes — shows up once per session
// (sessionStorage), never again after a completed registration
// (localStorage, see utils/sweepstakesStorage.js). Deliberately stays
// outside Modal.jsx's flow: it's a campaign piece, not a system dialog, so
// it gets a stronger visual treatment (brand gradient) instead of the
// standard white modal.
function SweepstakesPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  // Doesn't invite someone who's already on the registration page itself.
  const isOnSweepstakesPage = location.pathname === ROUTES.sweepstakes

  useEffect(() => {
    if (isOnSweepstakesPage || hasSeenSweepstakesPopup() || hasRegisteredForSweepstakes()) return

    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnSweepstakesPage])

  useEffect(() => {
    if (!isVisible) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  function handleClose() {
    markSweepstakesPopupSeen()
    setIsVisible(false)
  }

  function handleParticipate() {
    markSweepstakesPopupSeen()
    setIsVisible(false)
    navigate(ROUTES.sweepstakes)
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sweepstakes-popup-title"
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-brand-600 to-brand-800 text-center shadow-card-hover"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-3 px-6 py-9 sm:px-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
            <Gift className="h-7 w-7" />
          </span>
          <h2 id="sweepstakes-popup-title" className="text-xl leading-snug font-bold text-white sm:text-2xl">
            Participe do nosso sorteio!
          </h2>
          <p className="text-sm leading-relaxed text-white/85">
            Cadastre seus dados e concorra. É rápido e gratuito.
          </p>

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={handleParticipate}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              Participar do sorteio
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-lg py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SweepstakesPopup
