import { useEffect, useState } from 'react'
import { fetchAdsForPosition } from '../services/ads'

export function useAdsForPosition(position) {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchAdsForPosition(position).then(({ data, error }) => {
      if (!isMounted) return
      setAds(error ? [] : (data ?? []))
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [position])

  return { ads, loading }
}
