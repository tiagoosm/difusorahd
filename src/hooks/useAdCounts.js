import { useCallback, useEffect, useState } from 'react'
import { fetchAdCountsByPosition } from '../services/ads'

export function useAdCounts() {
  const [counts, setCounts] = useState({})

  const reload = useCallback(async () => {
    const data = await fetchAdCountsByPosition()
    setCounts(data)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { counts, reload }
}
