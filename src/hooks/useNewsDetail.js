import { useCallback, useEffect, useState } from 'react'
import { fetchNewsBySlug, fetchRelatedNews, incrementNewsViews } from '../services/news'
import { trackPageView } from '../services/analytics'

export function useNewsDetail(slug) {
  const [news, setNews] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setNotFound(false)
    setError(null)

    async function load() {
      const { data: newsData, error: fetchError } = await fetchNewsBySlug(slug)

      if (!isMounted) return

      // Falha de rede != notícia inexistente — antes as duas mostravam
      // "Notícia não encontrada", escondendo um problema de conexão.
      if (fetchError) {
        setError(fetchError)
        setLoading(false)
        return
      }

      if (!newsData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setNews(newsData)
      setLoading(false)
      incrementNewsViews(slug)
      trackPageView({
        page: `/noticia/${slug}`,
        pageType: 'news',
        newsId: newsData.id,
        categoryId: newsData.category?.id,
      })

      if (newsData.category?.id) {
        const { data: relatedData } = await fetchRelatedNews({
          categoryId: newsData.category.id,
          excludeId: newsData.id,
        })
        if (isMounted) setRelated(relatedData ?? [])
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [slug, reloadKey])

  return { news, related, loading, notFound, error, retry }
}
