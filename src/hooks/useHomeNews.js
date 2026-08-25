import { useEffect, useState } from 'react'
import { fetchFeaturedNews, fetchLatestNews, fetchWeeklyTopNews } from '../services/news'
import { trackPageView } from '../services/analytics'

const MOST_READ_DISPLAY_COUNT = 5
const LATEST_DISPLAY_COUNT = 6
// "Mais Lidas" (coluna lateral, 5 itens compactos) termina antes de
// "Últimas notícias" (coluna larga, 3 linhas de cards), sobrando o
// equivalente a uma linha vazia na lateral. Busca 1 item a mais para
// preencher essa última linha com um card no mesmo estilo da grade ao
// lado, em vez de deixar o espaço em branco.
const LATEST_SIDEBAR_FILL_COUNT = 1

export function useHomeNews() {
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [latestFiller, setLatestFiller] = useState([])
  const [mostRead, setMostRead] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const [featuredResult, latestResult, mostReadResult] = await Promise.all([
        fetchFeaturedNews(6),
        fetchLatestNews(LATEST_DISPLAY_COUNT + LATEST_SIDEBAR_FILL_COUNT),
        // Busca uma folga grande o bastante para sobrar MOST_READ_DISPLAY_COUNT
        // mesmo no pior caso (todo mundo do topo já está em Destaques/Últimas).
        fetchWeeklyTopNews(MOST_READ_DISPLAY_COUNT + 15),
      ])

      if (!isMounted) return

      const featuredItems = featuredResult.data ?? []
      const allLatestItems = latestResult.data ?? []
      const latestItems = allLatestItems.slice(0, LATEST_DISPLAY_COUNT)
      const latestFillerItems = allLatestItems.slice(LATEST_DISPLAY_COUNT)

      // Destaques e últimas são seções independentes: uma notícia em
      // destaque continua aparecendo normalmente aqui se for recente.
      setFeatured(featuredItems)
      setLatest(latestItems)
      setLatestFiller(latestFillerItems)

      // Mais Lidas não repete notícia já exibida em Destaques/Últimas
      // (incluindo o preenchimento da lateral) — busca uma folga extra
      // (acima) e corta pro tamanho final aqui.
      const alreadyShown = new Set([...featuredItems, ...allLatestItems].map((item) => item.id))
      const mostReadItems = (mostReadResult.data ?? [])
        .filter((item) => !alreadyShown.has(item.id))
        .slice(0, MOST_READ_DISPLAY_COUNT)
      setMostRead(mostReadItems)

      setLoading(false)
      trackPageView({ page: '/', pageType: 'home' })
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { featured, latest, latestFiller, mostRead, loading }
}
