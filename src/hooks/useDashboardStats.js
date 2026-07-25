import { useEffect, useState } from 'react'
import { fetchNewsCountByStatus, fetchPublishedViewsSum, fetchRecentNews } from '../services/news'
import { fetchCategoriesCount } from '../services/categories'

export function useDashboardStats() {
  const [stats, setStats] = useState({ published: 0, drafts: 0, categories: 0, totalViews: 0 })
  const [recentNews, setRecentNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const [publishedResult, draftResult, categoriesResult, totalViews, recentResult] = await Promise.all([
        fetchNewsCountByStatus('published'),
        fetchNewsCountByStatus('draft'),
        fetchCategoriesCount(),
        fetchPublishedViewsSum(),
        fetchRecentNews(5),
      ])

      if (!isMounted) return

      setStats({
        published: publishedResult.count ?? 0,
        drafts: draftResult.count ?? 0,
        categories: categoriesResult.count ?? 0,
        totalViews,
      })
      setRecentNews(recentResult.data ?? [])
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { stats, recentNews, loading }
}
