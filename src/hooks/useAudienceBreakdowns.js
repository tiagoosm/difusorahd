import { useEffect, useState } from 'react'
import {
  fetchAnalyticsByDevice,
  fetchAnalyticsByOs,
  fetchAnalyticsByBrowser,
  fetchAnalyticsByLocation,
  fetchAnalyticsByHour,
} from '../services/analytics'

const EMPTY = { byDevice: [], byOs: [], byBrowser: [], byLocation: [], byHour: [] }

export function useAudienceBreakdowns(range) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([
      fetchAnalyticsByDevice(range.start, range.end),
      fetchAnalyticsByOs(range.start, range.end),
      fetchAnalyticsByBrowser(range.start, range.end),
      fetchAnalyticsByLocation(range.start, range.end),
      fetchAnalyticsByHour(range.start, range.end),
    ]).then(([byDevice, byOs, byBrowser, byLocation, byHour]) => {
      if (!isMounted) return
      setData({ byDevice, byOs, byBrowser, byLocation, byHour })
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [range.start, range.end])

  return { ...data, loading }
}
