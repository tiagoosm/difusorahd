import { useEffect, useState } from 'react'
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

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setNotFound(false)

    async function load() {
      const { data: categoryData, error: categoryError } = await fetchCategoryBySlug(slug)

      if (!isMounted) return

      if (categoryError || !categoryData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCategory(categoryData)
      trackPageView({ page: `/categoria/${slug}`, pageType: 'category', categoryId: categoryData.id })

      const { data: newsData, count } = await fetchNewsByCategory({
        categoryId: categoryData.id,
        page,
        pageSize: PAGE_SIZE,
      })

      if (!isMounted) return
      setNews(newsData ?? [])
      setTotalCount(count ?? 0)
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [slug, page])

  return { category, news, totalCount, pageSize: PAGE_SIZE, loading, notFound }
}
