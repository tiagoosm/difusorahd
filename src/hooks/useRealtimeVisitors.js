import { useEffect, useState } from 'react'
import { fetchRealtimeVisitors } from '../services/analytics'

const POLL_INTERVAL_MS = 30_000

// "Tempo real" aqui é poll a cada 30s (não uma subscription via websocket) —
// simples o suficiente para um indicador auxiliar, sem a complexidade extra
// do Supabase Realtime para um número que não precisa atualizar no segundo.
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
