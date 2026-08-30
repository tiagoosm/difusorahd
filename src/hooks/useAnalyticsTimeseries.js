import { useEffect, useState } from 'react'
import { fetchAnalyticsTimeseries } from '../services/analytics'

// Grouping by hour only makes sense for short periods (Today/Yesterday) —
// for anything longer, the chart would become unreadable with hundreds of
// points.
function pickBucket(start, end) {
  const spanHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return spanHours <= 48 ? 'hour' : 'day'
}

export function useAnalyticsTimeseries(range) {
  const [data, setData] = useState([])
  const [bucket, setBucket] = useState('day')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const nextBucket = pickBucket(range.start, range.end)

    fetchAnalyticsTimeseries(range.start, range.end, nextBucket).then((rows) => {
      if (!isMounted) return
      setBucket(nextBucket)
      setData(rows)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [range.start, range.end])

  return { data, bucket, loading }
}
