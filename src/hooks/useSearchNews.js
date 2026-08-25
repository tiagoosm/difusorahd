import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchNews } from '../services/news'
import { trackPageView } from '../services/analytics'

const PAGE_SIZE = 9

async function fetchSearchData(query, page) {
  const { data, count, error } = await searchNews({ query, page, pageSize: PAGE_SIZE })
  if (error) throw error
  return { news: data ?? [], totalCount: count ?? 0 }
}

export function useSearchNews(query, page) {
  const searchQuery = useQuery({
    queryKey: ['search', query, page],
    queryFn: () => fetchSearchData(query, page),
    enabled: !!query,
  })

  // Rastreia cada busca nova (termo + página) uma vez, quando os resultados
  // chegam — não a cada re-render nem de novo por causa de refetch em cache.
  const trackedKeyRef = useRef(null)
  useEffect(() => {
    if (!query || !searchQuery.isSuccess) return
    const key = `${query}:${page}`
    if (trackedKeyRef.current === key) return
    trackedKeyRef.current = key
    trackPageView({ page: '/busca', pageType: 'search' })
  }, [query, page, searchQuery.isSuccess])

  if (!query) {
    return { news: [], totalCount: 0, pageSize: PAGE_SIZE, loading: false, error: null, retry: () => {} }
  }

  return {
    news: searchQuery.data?.news ?? [],
    totalCount: searchQuery.data?.totalCount ?? 0,
    pageSize: PAGE_SIZE,
    loading: searchQuery.isLoading,
    error: searchQuery.error ?? null,
    retry: searchQuery.refetch,
  }
}
