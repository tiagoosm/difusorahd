import { useCallback, useEffect, useState } from 'react'
import { fetchSweepstakesParticipantsAdmin } from '../services/sweepstakes'

const PAGE_SIZE = 10

export function useSweepstakesParticipants({ search, status, dateFrom, dateTo, page }) {
  const [participants, setParticipants] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, count, error: fetchError } = await fetchSweepstakesParticipantsAdmin({
      search,
      status,
      dateFrom,
      dateTo,
      page,
      pageSize: PAGE_SIZE,
    })

    if (fetchError) {
      setError(fetchError)
      setLoading(false)
      return
    }

    setParticipants(data ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [search, status, dateFrom, dateTo, page])

  useEffect(() => {
    reload()
  }, [reload])

  return { participants, totalCount, pageSize: PAGE_SIZE, loading, error, reload }
}
