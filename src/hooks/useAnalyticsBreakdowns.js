import { useEffect, useState } from 'react'
import { fetchAnalyticsBySource, fetchAnalyticsByCategory } from '../services/analytics'

export function useAnalyticsBreakdowns(range) {
  const [bySource, setBySource] = useState([])
  const [byCategory, setByCategory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([fetchAnalyticsBySource(range.start, range.end), fetchAnalyticsByCategory(range.start, range.end)]).then(
      ([sourceRows, categoryRows]) => {
        if (!isMounted) return
        setBySource(sourceRows)
        setByCategory(categoryRows)
        setLoading(false)
      },
    )

    return () => {
      isMounted = false
    }
  }, [range.start, range.end])

  return { bySource, byCategory, loading }
}
