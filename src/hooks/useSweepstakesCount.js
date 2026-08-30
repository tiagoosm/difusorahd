import { useCallback, useEffect, useState } from 'react'
import { fetchSweepstakesParticipantsCount } from '../services/sweepstakes'

// Count for the summary at the top of the Sweepstakes section
// ("Registered participants: 000") — separate from the table's paginated
// query, so it keeps showing the real total even with search/status
// filters applied to the list below.
export function useSweepstakesCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { count: total } = await fetchSweepstakesParticipantsCount()
    setCount(total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { count, loading, reload }
}
