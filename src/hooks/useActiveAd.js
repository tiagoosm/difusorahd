import { useEffect, useState } from 'react'
import { fetchActiveAd } from '../services/ads'

export function useActiveAd(position) {
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchActiveAd(position).then(({ data, error }) => {
      if (!isMounted) return
      setAd(error ? null : (data ?? null))
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [position])

  return { ad, loading }
}
