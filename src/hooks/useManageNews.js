import { useCallback, useEffect, useState } from 'react'
import { fetchAllNewsAdmin } from '../services/news'

export function useManageNews({
  status,
  categoryId,
  search,
  sort,
  publishedFrom,
  publishedTo,
  page,
  pageSize,
}) {
  const [news, setNews] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, count } = await fetchAllNewsAdmin({
      status,
      categoryId,
      search,
      sort,
      publishedFrom,
      publishedTo,
      page,
      pageSize,
    })
    setNews(data ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [status, categoryId, search, sort, publishedFrom, publishedTo, page, pageSize])

  useEffect(() => {
    reload()
  }, [reload])

  return { news, totalCount, loading, reload }
}
