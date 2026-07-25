import { useEffect, useState } from 'react'
import { searchNews } from '../services/news'

const PAGE_SIZE = 9

export function useSearchNews(query, page) {
  const [news, setNews] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setNews([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    searchNews({ query, page, pageSize: PAGE_SIZE }).then(({ data, count }) => {
      if (!isMounted) return
      setNews(data ?? [])
      setTotalCount(count ?? 0)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [query, page])

  return { news, totalCount, pageSize: PAGE_SIZE, loading }
}
