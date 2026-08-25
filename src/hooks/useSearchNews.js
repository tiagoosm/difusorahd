import { useCallback, useEffect, useState } from 'react'
import { searchNews } from '../services/news'
import { trackPageView } from '../services/analytics'

const PAGE_SIZE = 9

export function useSearchNews(query, page) {
  const [news, setNews] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!query) {
      setNews([])
      setTotalCount(0)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    searchNews({ query, page, pageSize: PAGE_SIZE }).then(({ data, count, error: searchError }) => {
      if (!isMounted) return

      // Sem isso, uma busca que falhou mostrava "Não encontramos nenhuma
      // matéria para sua busca" — o usuário concluiria que o termo não
      // existe no site, quando na verdade a requisição nem completou.
      if (searchError) {
        setError(searchError)
        setLoading(false)
        return
      }

      setNews(data ?? [])
      setTotalCount(count ?? 0)
      setLoading(false)
      trackPageView({ page: '/busca', pageType: 'search' })
    })

    return () => {
      isMounted = false
    }
  }, [query, page, reloadKey])

  return { news, totalCount, pageSize: PAGE_SIZE, loading, error, retry }
}
