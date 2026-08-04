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
        fetchFeaturedNews(6),
        fetchLatestNews(6),
      ])

      if (!isMounted) return

      // Destaques e últimas são seções independentes: uma notícia em
      // destaque continua aparecendo normalmente aqui se for recente.
      setFeatured(featuredResult.data ?? [])
      setLatest(latestResult.data ?? [])
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { featured, latest, loading }
}
