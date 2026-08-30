import { useEffect, useState } from 'react'
import { fetchTopNews } from '../services/analytics'

export const TOP_NEWS_PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'last7', label: '7 dias' },
  { value: 'last30', label: '30 dias' },
  { value: 'all', label: 'Todo o período' },
]

const EPOCH = new Date(0)

function rangeFor(period) {
  const now = new Date()
  if (period === 'all') return { start: EPOCH, end: now }
  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { start, end: now }
  }
  const days = period === 'last30' ? 30 : 7
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return { start, end: now }
}

// The "Most read articles" section has its own period control (item 5),
// independent from the dashboard's global period.
export function useTopNews(initialPeriod = 'last7') {
  const [period, setPeriod] = useState(initialPeriod)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const { start, end } = rangeFor(period)

    fetchTopNews(start, end, 8).then((rows) => {
      if (!isMounted) return
      setNews(rows)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [period])

  return { period, setPeriod, news, loading }
}
