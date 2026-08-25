import { useCallback, useEffect, useState } from 'react'
import { fetchCategoryBySlug } from '../services/categories'
import { fetchNewsByCategory } from '../services/news'
import { trackPageView } from '../services/analytics'

const PAGE_SIZE = 9

export function useCategoryNews(slug, page) {
  const [category, setCategory] = useState(null)
  const [news, setNews] = useState([])
  const [totalCount, setTotalCount] = useState(0)
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
      const { data: categoryData, error: categoryError } = await fetchCategoryBySlug(slug)

      if (!isMounted) return

      // Erro de request e "categoria inexistente" são situações diferentes:
      // antes as duas caíam em notFound e o site dizia "Categoria não
      // encontrada" mesmo quando era só a rede que tinha falhado.
      if (categoryError) {
        setError(categoryError)
        setLoading(false)
        return
      }

      if (!categoryData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCategory(categoryData)
      trackPageView({ page: `/categoria/${slug}`, pageType: 'category', categoryId: categoryData.id })

      const { data: newsData, count, error: newsError } = await fetchNewsByCategory({
        categoryId: categoryData.id,
        page,
        pageSize: PAGE_SIZE,
      })

      if (!isMounted) return

      if (newsError) {
        setError(newsError)
        setLoading(false)
        return
      }

      setNews(newsData ?? [])
      setTotalCount(count ?? 0)
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [slug, page, reloadKey])

  return { category, news, totalCount, pageSize: PAGE_SIZE, loading, notFound, error, retry }
}
