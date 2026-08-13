import { useEffect, useState } from 'react'
import { fetchAnalyticsSummary } from '../services/analytics'
import { fetchPublishedNewsCount } from '../services/news'

const EMPTY = { views: 0, visitors: 0, news: 0 }

export function useAnalyticsSummary(range) {
  const [current, setCurrent] = useState(EMPTY)
  const [previous, setPrevious] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function load() {
      const [currentSummary, previousSummary, currentNews, previousNews] = await Promise.all([
        fetchAnalyticsSummary(range.start, range.end),
        fetchAnalyticsSummary(range.previousStart, range.previousEnd),
        fetchPublishedNewsCount(range.start, range.end),
        fetchPublishedNewsCount(range.previousStart, range.previousEnd),
      ])

      if (!isMounted) return

      setCurrent({ ...currentSummary, news: currentNews.count ?? 0 })
      setPrevious({ ...previousSummary, news: previousNews.count ?? 0 })
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [range.start, range.end, range.previousStart, range.previousEnd])

  return { current, previous, loading }
}
