import { useCallback, useEffect, useState } from 'react'
import { fetchAllAdsAdmin } from '../services/ads'

const PAGE_SIZE = 10

export function useAds({ position, status, search, sort, page }) {
  const [ads, setAds] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, count } = await fetchAllAdsAdmin({
      position,
      status,
      search,
      sort,
      page,
      pageSize: PAGE_SIZE,
    })
    setAds(data ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [position, status, search, sort, page])

  useEffect(() => {
    reload()
  }, [reload])

  return { ads, totalCount, pageSize: PAGE_SIZE, loading, reload }
}
