import { useEffect, useState } from 'react'
import { fetchNewsById } from '../services/news'

export function useNewsEditor(id) {
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setNotFound(false)

    fetchNewsById(id).then(({ data, error }) => {
      if (!isMounted) return

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setNews(data)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  return { news, loading, notFound }
}
