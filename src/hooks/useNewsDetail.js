import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNewsBySlug, fetchRelatedNews, incrementNewsViews } from '../services/news'
import { trackPageView } from '../services/analytics'

async function fetchNewsData(slug) {
  const { data, error } = await fetchNewsBySlug(slug)
  if (error) throw error
  return data // null = notícia inexistente (não é erro de request)
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

  // Relacionadas são conteúdo de apoio: sua falha não bloqueia a leitura da
  // matéria principal (não entra no `error` retornado abaixo).
  const relatedQuery = useQuery({
    queryKey: ['news', slug, 'related', categoryId],
    queryFn: () => fetchRelatedData(categoryId, news.id),
    enabled: !!categoryId,
  })

  // Contabiliza view e envia o pageview uma única vez por notícia carregada
  // — não a cada re-render, e de novo naturalmente se um retry (após erro)
  // eventualmente tiver sucesso, já que aí é a primeira vez que este id
  // passa por aqui.
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
