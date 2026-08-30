import { useEffect, useState } from 'react'
import { fetchRealtimeVisitors } from '../services/analytics'

const POLL_INTERVAL_MS = 30_000

// "Real-time" here means polling every 30s (not a websocket subscription) —
// simple enough for a secondary indicator, without the extra complexity of
// Supabase Realtime for a number that doesn't need to update by the second.
export function useRealtimeVisitors() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const value = await fetchRealtimeVisitors()
        if (isMounted) setCount(value)
      } catch {
        if (isMounted) setCount(null)
      }
    }

    load()
    const interval = setInterval(load, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return count
}
