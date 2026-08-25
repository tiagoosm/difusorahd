import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedNews, fetchLatestNews, fetchWeeklyTopNews } from '../services/news'
import { trackPageView } from '../services/analytics'

const MOST_READ_DISPLAY_COUNT = 5
const LATEST_DISPLAY_COUNT = 6
// No mobile, "Últimas notícias" é uma lista contínua de 9 (não 6) — a versão
// mobile é uma lista compacta (linha), não uma grade 2x3, então cabe mais
// conteúdo útil por rolagem sem os "espaços vazios" de uma grade quebrada.
// O desktop continua mostrando só os 6 primeiros (ver CARD_POSITION em
// LatestNewsList.jsx) — os 3 extras ficam ocultos ali via md:hidden.
const LATEST_MOBILE_EXTRA_COUNT = 3
// "Mais Lidas" (coluna lateral, 5 itens compactos) termina antes de
// "Últimas notícias" (coluna larga, 3 linhas de cards), sobrando o
// equivalente a uma linha vazia na lateral. Busca 1 item a mais para
// preencher essa última linha com um card no mesmo estilo da grade ao
// lado, em vez de deixar o espaço em branco. Só aparece no desktop.
const LATEST_SIDEBAR_FILL_COUNT = 1

async function fetchFeaturedData() {
  const { data, error } = await fetchFeaturedNews(6)
  if (error) throw error
  return data ?? []
}

async function fetchLatestData() {
  const { data, error } = await fetchLatestNews(
    LATEST_DISPLAY_COUNT + LATEST_MOBILE_EXTRA_COUNT + LATEST_SIDEBAR_FILL_COUNT,
  )
  if (error) throw error
  return data ?? []
}

async function fetchMostReadData() {
  // Busca uma folga grande o bastante para sobrar MOST_READ_DISPLAY_COUNT
  // mesmo no pior caso (todo mundo do topo já está em Destaques/Últimas).
  const { data, error } = await fetchWeeklyTopNews(MOST_READ_DISPLAY_COUNT + 15)
  if (error) throw error
  return data ?? []
}

export function useHomeNews() {
  const featuredQuery = useQuery({ queryKey: ['home', 'featured'], queryFn: fetchFeaturedData })
  const latestQuery = useQuery({ queryKey: ['home', 'latest'], queryFn: fetchLatestData })
  // Mais Lidas é complementar: sua própria falha não bloqueia a Home (ver
  // `error` abaixo, que só olha featured/latest).
  const mostReadQuery = useQuery({ queryKey: ['home', 'mostRead'], queryFn: fetchMostReadData })

  const loading = featuredQuery.isLoading || latestQuery.isLoading || mostReadQuery.isLoading
  const error = featuredQuery.error ?? latestQuery.error ?? null

  const featuredItems = featuredQuery.data ?? []
  const allLatestItems = latestQuery.data ?? []
  const latestItems = allLatestItems.slice(0, LATEST_DISPLAY_COUNT)
  const latestMobileExtraItems = allLatestItems.slice(
    LATEST_DISPLAY_COUNT,
    LATEST_DISPLAY_COUNT + LATEST_MOBILE_EXTRA_COUNT,
  )
  const latestFillerItems = allLatestItems.slice(LATEST_DISPLAY_COUNT + LATEST_MOBILE_EXTRA_COUNT)

  // Mais Lidas não repete notícia já exibida em Destaques/Últimas
  // (incluindo o preenchimento da lateral).
  const alreadyShown = new Set([...featuredItems, ...allLatestItems].map((item) => item.id))
  const mostReadItems = (mostReadQuery.data ?? [])
    .filter((item) => !alreadyShown.has(item.id))
    .slice(0, MOST_READ_DISPLAY_COUNT)

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
  }

  return {
    featured: featuredItems,
    latest: latestItems,
    latestMobileExtra: latestMobileExtraItems,
    latestFiller: latestFillerItems,
    mostRead: mostReadItems,
    loading,
    error,
    retry,
  }
}
