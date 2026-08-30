import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNewsBySlug, fetchRelatedNews, incrementNewsViews } from '../services/news'
import { trackPageView } from '../services/analytics'

async function fetchNewsData(slug) {
  const { data, error } = await fetchNewsBySlug(slug)
  if (error) throw error
  return data // null = article doesn't exist (not a request error)
}

async function fetchRelatedData(categoryId, excludeId) {
  const { data, error } = await fetchRelatedNews({ categoryId, excludeId })
  if (error) throw error
  return data ?? []
}

export function useNewsDetail(slug) {
  const newsQuery = useQuery({
    queryKey: ['news', slug],
    queryFn: () => fetchNewsData(slug),
    enabled: !!slug,
  })

  const news = newsQuery.data ?? null
  const notFound = newsQuery.isSuccess && !news
  const categoryId = news?.category?.id

  // Related articles are supporting content: their failure doesn't block
  // reading the main article (doesn't feed into the `error` returned below).
  const relatedQuery = useQuery({
    queryKey: ['news', slug, 'related', categoryId],
    queryFn: () => fetchRelatedData(categoryId, news.id),
    enabled: !!categoryId,
  })

  // Counts the view and sends the pageview once per loaded article — not
  // on every re-render, and naturally again if a retry (after an error)
  // eventually succeeds, since that's the first time this id passes through here.
  const trackedIdRef = useRef(null)
  useEffect(() => {
    if (!news || trackedIdRef.current === news.id) return
    trackedIdRef.current = news.id
    incrementNewsViews(slug)
    trackPageView({ page: `/noticia/${slug}`, pageType: 'news', newsId: news.id, categoryId: news.category?.id })
  }, [news, slug])

  return {
    news,
    related: relatedQuery.data ?? [],
    loading: newsQuery.isLoading,
    notFound,
    error: newsQuery.error ?? null,
    retry: newsQuery.refetch,
  }
}
