import { useEffect, useRef, useState } from 'react'

const DEFAULT_TOP_THRESHOLD = 8
const DEFAULT_DELTA_THRESHOLD = 8

// Tracks scroll direction to drive show/hide of something that should
// disappear while scrolling down and reappear while scrolling up (e.g. a
// secondary nav strip) — always reports visible near the top of the page,
// and ignores sub-threshold jitter (trackpad/wheel noise) so it doesn't
// flicker. Throttled via requestAnimationFrame with a passive listener,
// so it adds no meaningful cost to scrolling.
export function useScrollDirectionVisibility({
  topThreshold = DEFAULT_TOP_THRESHOLD,
  deltaThreshold = DEFAULT_DELTA_THRESHOLD,
} = {}) {
  const [visible, setVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    lastScrollYRef.current = window.scrollY
    let ticking = false

    function update() {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current

      if (currentY <= topThreshold) {
        setVisible(true)
      } else if (delta > deltaThreshold) {
        setVisible(false)
      } else if (delta < -deltaThreshold) {
        setVisible(true)
      }

      lastScrollYRef.current = currentY
      ticking = false
    }

    function handleScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [topThreshold, deltaThreshold])

  return visible
}
