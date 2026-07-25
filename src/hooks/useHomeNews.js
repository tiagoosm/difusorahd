import { useEffect, useState } from 'react'
import { fetchFeaturedNews, fetchLatestNews } from '../services/news'

export function useHomeNews() {
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const [featuredResult, latestResult] = await Promise.all([
        fetchFeaturedNews(3),
        fetchLatestNews(6),
      ])

      if (!isMounted) return

      const featuredItems = featuredResult.data ?? []
      const featuredIds = new Set(featuredItems.map((item) => item.id))
      const latestItems = (latestResult.data ?? []).filter((item) => !featuredIds.has(item.id))

      setFeatured(featuredItems)
      setLatest(latestItems)
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { featured, latest, loading }
}
