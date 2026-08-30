import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedNews, fetchLatestNews, fetchWeeklyTopNews } from '../services/news'
import { useCategories } from './useCategories'
import { trackPageView } from '../services/analytics'

const LATEST_DISPLAY_COUNT = 9
const MOST_READ_DISPLAY_COUNT = 10
const CATEGORY_SECTION_COUNT = 3

// Pool compartilhado por TODAS as seções de categoria: 1 única requisição
// (as N notícias mais recentes do site inteiro), agrupada por categoria no
// cliente — em vez de 1 requisição por categoria existente (ver item 9 do
// pedido: "não faça uma requisição individual para cada categoria"). O
// tamanho do pool escala com o número de categorias (mais categorias =
// pool maior, pra manter ~3 notícias recentes por categoria), com um piso e
// um teto pra nunca virar 1 request nem excessivamente pesada.
const CATEGORY_POOL_PER_CATEGORY = 15
const CATEGORY_POOL_MIN = 60
const CATEGORY_POOL_MAX = 300

async function fetchFeaturedData() {
  const { data, error } = await fetchFeaturedNews(6)
  if (error) throw error
  return data ?? []
}

async function fetchLatestData() {
  const { data, error } = await fetchLatestNews(LATEST_DISPLAY_COUNT)
  if (error) throw error
  return data ?? []
}

async function fetchMostReadData() {
  // Busca uma folga grande o bastante para sobrar MOST_READ_DISPLAY_COUNT
  // mesmo no pior caso (todo mundo do topo já está em Destaques/Últimas).
  const { data, error } = await fetchWeeklyTopNews(MOST_READ_DISPLAY_COUNT + 20)
  if (error) throw error
  return data ?? []
}

function makeFetchCategoryPool(poolSize) {
  return async () => {
    const { data, error } = await fetchLatestNews(poolSize)
    if (error) throw error
    return data ?? []
  }
}

export function useHomeNews() {
  // Categorias são 100% dinâmicas (tabela `categories`) — nunca hardcoded
  // aqui. Se uma categoria for criada/removida, a lista muda e as seções
  // abaixo acompanham automaticamente, sem alterar este hook.
  const { categories } = useCategories()
  const poolSize = Math.min(
    CATEGORY_POOL_MAX,
    Math.max(CATEGORY_POOL_MIN, categories.length * CATEGORY_POOL_PER_CATEGORY),
  )

  const featuredQuery = useQuery({ queryKey: ['home', 'featured'], queryFn: fetchFeaturedData })
  const latestQuery = useQuery({ queryKey: ['home', 'latest'], queryFn: fetchLatestData })
  // Mais Lidas é complementar: sua própria falha não bloqueia a Home (ver
  // `error` abaixo, que só olha featured/latest).
  const mostReadQuery = useQuery({ queryKey: ['home', 'mostRead'], queryFn: fetchMostReadData })
  const categoryPoolQuery = useQuery({
    queryKey: ['home', 'categoryPool', poolSize],
    queryFn: makeFetchCategoryPool(poolSize),
    enabled: categories.length > 0,
  })

  const loading = featuredQuery.isLoading || latestQuery.isLoading || mostReadQuery.isLoading
  const error = featuredQuery.error ?? latestQuery.error ?? null

  const featuredItems = featuredQuery.data ?? []
  const latestItems = latestQuery.data ?? []

  // Mais Lidas não repete notícia já exibida em Destaques/Últimas. Isso é
  // deliberado (evita repetir a mesma notícia duas vezes acima da dobra) —
  // já as seções de categoria PODEM repetir notícias de Últimas/Mais Lidas,
  // porque são contextos diferentes (ver pedido original, item 3.4).
  const alreadyShown = new Set([...featuredItems, ...latestItems].map((item) => item.id))
  const mostReadItems = (mostReadQuery.data ?? [])
    .filter((item) => !alreadyShown.has(item.id))
    .slice(0, MOST_READ_DISPLAY_COUNT)

  // Uma seção por categoria existente, na mesma ordem de useCategories()
  // (alfabética), com as 3 notícias mais recentes daquela categoria.
  // Categoria sem nenhuma notícia publicada não gera seção (sem bloco vazio).
  const categoryPool = categoryPoolQuery.data ?? []
  const categorySections = categories
    .map((category) => ({
      category,
      items: categoryPool.filter((item) => item.category?.id === category.id).slice(0, CATEGORY_SECTION_COUNT),
    }))
    .filter((section) => section.items.length > 0)

  // Dispara uma única vez por carregamento bem-sucedido — não a cada
  // re-render, e não de novo se o usuário só voltou o foco pra aba.
  const trackedRef = useRef(false)
  useEffect(() => {
    if (loading || error || trackedRef.current) return
    trackedRef.current = true
    trackPageView({ page: '/', pageType: 'home' })
  }, [loading, error])

  function retry() {
    featuredQuery.refetch()
    latestQuery.refetch()
    mostReadQuery.refetch()
    categoryPoolQuery.refetch()
  }

  return {
    featured: featuredItems,
    latest: latestItems,
    categorySections,
    mostRead: mostReadItems,
    loading,
    error,
    retry,
  }
}
