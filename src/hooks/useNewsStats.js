import { useCallback, useEffect, useState } from 'react'
import { fetchNewsStats } from '../services/news'

const EMPTY_STATS = { total: 0, published: 0, drafts: 0, publishedThisMonth: 0, totalViews: 0 }

export function useNewsStats() {
  const [stats, setStats] = useState(EMPTY_STATS)

  const reload = useCallback(async () => {
    const data = await fetchNewsStats()
    setStats(data)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { stats, reload }
}
