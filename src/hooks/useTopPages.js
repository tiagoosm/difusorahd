import { useEffect, useState } from 'react'
import { fetchTopPages } from '../services/analytics'

export function useTopPages(range) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchTopPages(range.start, range.end, 10).then((rows) => {
      if (!isMounted) return
      setPages(rows)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [range.start, range.end])

  return { pages, loading }
}
