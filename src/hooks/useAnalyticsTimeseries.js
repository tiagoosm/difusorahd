import { useCallback, useEffect, useState } from 'react'
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
  const [error, setError] = useState(null)
  // Bumped by retry() to re-run the effect below without needing a new
  // `range` — a failed request should be retryable without changing period.
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    const nextBucket = pickBucket(range.start, range.end)

    fetchAnalyticsTimeseries(range.start, range.end, nextBucket)
      .then((rows) => {
        if (!isMounted) return
        setBucket(nextBucket)
        setData(rows)
      })
      .catch((err) => {
        if (!isMounted) return
        // Without this catch, a rejected request left `loading` stuck at
        // true forever (and `data` at []) — the chart showed a permanent
        // skeleton instead of a failure, and the rejection surfaced only
        // as an unhandled-promise warning in the console.
        console.error('useAnalyticsTimeseries: failed to load', err)
        setError(err)
        setData([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
    // Depends on the VALUE of the range (timestamps), not the Date objects'
    // identity — a caller that doesn't memoize `range` (it's easy to forget;
    // getPeriodRange() returns new Date instances every call) would
    // otherwise make this effect re-run on every unrelated re-render,
    // including ones this very hook's own setState calls trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start.getTime(), range.end.getTime(), reloadToken])

  const retry = useCallback(() => setReloadToken((token) => token + 1), [])

  return { data, bucket, loading, error, retry }
}
