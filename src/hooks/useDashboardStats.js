import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchNewsStats, fetchRecentNews } from '../services/news'
import { fetchAnalyticsSummary } from '../services/analytics'
import { getPeriodRange } from '../utils/analyticsPeriods'

const EMPTY_NEWS_STATS = { total: 0, published: 0, drafts: 0, publishedThisMonth: 0, totalViews: 0 }
const EMPTY_SUMMARY = { views: 0, visitors: 0 }

// Reuses fetchNewsStats (already used in ManageNews) for the content
// counts, and fetchAnalyticsSummary (already used in /admin/analise) for
// today/7 days with comparison — no new counting, just gathering what
// already exists into a single load for the Dashboard.
export function useDashboardStats() {
  const [newsStats, setNewsStats] = useState(EMPTY_NEWS_STATS)
  const [today, setToday] = useState(EMPTY_SUMMARY)
  const [yesterday, setYesterday] = useState(EMPTY_SUMMARY)
  const [last7, setLast7] = useState(EMPTY_SUMMARY)
  const [previous7, setPrevious7] = useState(EMPTY_SUMMARY)
  const [recentNews, setRecentNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const todayRange = getPeriodRange('today')
      const last7Range = getPeriodRange('last7')

      try {
        const [newsStatsResult, todaySummary, yesterdaySummary, last7Summary, previous7Summary, recentResult] =
          await Promise.all([
            fetchNewsStats(),
            fetchAnalyticsSummary(todayRange.start, todayRange.end),
            fetchAnalyticsSummary(todayRange.previousStart, todayRange.previousEnd),
            fetchAnalyticsSummary(last7Range.start, last7Range.end),
            fetchAnalyticsSummary(last7Range.previousStart, last7Range.previousEnd),
            fetchRecentNews(5),
          ])

        if (!isMounted) return

        setNewsStats(newsStatsResult)
        setToday(todaySummary)
        setYesterday(yesterdaySummary)
        setLast7(last7Summary)
        setPrevious7(previous7Summary)
        setRecentNews(recentResult.data ?? [])
      } catch (err) {
        // Without this catch, a rejected call in the Promise.all (e.g. one
        // flaky request) left `loading` stuck at true forever — every card
        // on the Dashboard stayed on its skeleton indefinitely instead of
        // falling back to showing what it could.
        if (!isMounted) return
        console.error('useDashboardStats: failed to load', err)
        toast.error('Não foi possível carregar algumas estatísticas do Dashboard.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { newsStats, today, yesterday, last7, previous7, recentNews, loading }
}
