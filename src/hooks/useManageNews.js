import { useCallback, useEffect, useState } from 'react'
import { fetchAllNewsAdmin } from '../services/news'

const PAGE_SIZE = 10

export function useManageNews({ status, categoryId, page }) {
  const [news, setNews] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, count } = await fetchAllNewsAdmin({ status, categoryId, page, pageSize: PAGE_SIZE })
    setNews(data ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [status, categoryId, page])

  useEffect(() => {
    reload()
  }, [reload])

  return { news, totalCount, pageSize: PAGE_SIZE, loading, reload }
}
