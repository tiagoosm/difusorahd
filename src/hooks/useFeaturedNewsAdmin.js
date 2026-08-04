import { useEffect, useState } from 'react'
import { fetchFeaturedNewsAdmin } from '../services/news'

export function useFeaturedNewsAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchFeaturedNewsAdmin().then(({ data, error }) => {
      if (!isMounted) return
      if (!error) setItems(data ?? [])
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return { items, loading }
}
