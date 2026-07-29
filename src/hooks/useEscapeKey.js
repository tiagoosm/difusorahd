import { useEffect } from 'react'

export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return

    function listener(event) {
      if (event.key === 'Escape') handler(event)
    }

    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [handler, active])
}
