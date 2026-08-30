import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPeriodRange } from '../utils/analyticsPeriods'

// Period state lives in the URL (?period=last30&from=...&to=...), following
// the same filter pattern already used in ManageNews/ManageAds — allows
// reloading/sharing the link with the selected period.
export function useAnalyticsPeriod() {
  const [searchParams, setSearchParams] = useSearchParams()
  const period = searchParams.get('period') || 'last7'
  const customFrom = searchParams.get('from') || ''
  const customTo = searchParams.get('to') || ''

  const range = useMemo(
    () => getPeriodRange(period, { from: customFrom, to: customTo }),
    [period, customFrom, customTo],
  )

  function setPeriod(nextPeriod) {
    if (nextPeriod === 'custom') {
      setSearchParams({ period: nextPeriod, from: customFrom, to: customTo })
    } else {
      setSearchParams({ period: nextPeriod })
    }
  }

  function setCustomRange({ from, to }) {
    setSearchParams({ period: 'custom', from, to })
  }

  return { period, customFrom, customTo, range, setPeriod, setCustomRange }
}
