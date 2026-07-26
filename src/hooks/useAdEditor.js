import { useEffect, useState } from 'react'
import { fetchAdById } from '../services/ads'

export function useAdEditor(id) {
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setNotFound(false)

    fetchAdById(id).then(({ data, error }) => {
      if (!isMounted) return

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setAd(data)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  return { ad, loading, notFound }
}
