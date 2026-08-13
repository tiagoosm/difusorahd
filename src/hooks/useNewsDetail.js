import { useEffect, useState } from 'react'
import { fetchNewsBySlug, fetchRelatedNews, incrementNewsViews } from '../services/news'
import { trackPageView } from '../services/analytics'

export function useNewsDetail(slug) {
  const [news, setNews] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setNotFound(false)

    async function load() {
      const { data: newsData, error } = await fetchNewsBySlug(slug)

      if (!isMounted) return

      if (error || !newsData) {
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
  }, [slug])

  return { news, related, loading, notFound }
}
