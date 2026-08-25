import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategoryBySlug } from '../services/categories'
import { fetchNewsByCategory } from '../services/news'
import { trackPageView } from '../services/analytics'

const PAGE_SIZE = 9

async function fetchCategoryData(slug) {
  const { data, error } = await fetchCategoryBySlug(slug)
  if (error) throw error
  return data // null = categoria inexistente (não é erro de request)
}

async function fetchCategoryNewsData(categoryId, page) {
  const { data, count, error } = await fetchNewsByCategory({ categoryId, page, pageSize: PAGE_SIZE })
  if (error) throw error
  return { news: data ?? [], totalCount: count ?? 0 }
}

export function useCategoryNews(slug, page) {
  const categoryQuery = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryData(slug),
    enabled: !!slug,
  })

  const category = categoryQuery.data ?? null
  // isSuccess (não só "!loading") garante que só declaramos notFound depois
  // de uma resposta real da API — nunca durante o estado inicial/pending.
  const notFound = categoryQuery.isSuccess && !category

  const newsQuery = useQuery({
    queryKey: ['category', slug, 'news', page],
    queryFn: () => fetchCategoryNewsData(category.id, page),
    enabled: !!category?.id,
  })

  const loading = categoryQuery.isLoading || newsQuery.isLoading
  const error = categoryQuery.error ?? newsQuery.error ?? null

  const trackedSlugRef = useRef(null)
  useEffect(() => {
    if (!category || trackedSlugRef.current === slug) return
    trackedSlugRef.current = slug
    trackPageView({ page: `/categoria/${slug}`, pageType: 'category', categoryId: category.id })
  }, [category, slug])

  function retry() {
    categoryQuery.refetch()
    newsQuery.refetch()
  }

  return {
    category,
    news: newsQuery.data?.news ?? [],
    totalCount: newsQuery.data?.totalCount ?? 0,
    pageSize: PAGE_SIZE,
    loading,
    notFound,
    error,
    retry,
  }
}
