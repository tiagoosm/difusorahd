import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// SPA navigations swap the component tree via the History API, without
// the full reload that would make the browser reset scroll on its own —
// that's why every push route change needs to trigger this manually. POP
// navigations (back/forward button) are left out: the browser already
// restores the original scroll position on its own, and forcing the top
// would break that expectation.
//
// To preserve scroll in some future case, navigate passing
// `state: { preserveScroll: true }`.
function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    if (location.state?.preserveScroll) return

    window.scrollTo(0, 0)
  }, [location.key, navigationType, location.state])

  return null
}

export default ScrollToTop
