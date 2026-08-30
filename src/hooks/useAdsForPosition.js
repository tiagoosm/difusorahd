import { useQuery } from '@tanstack/react-query'
import { fetchAdsForPosition } from '../services/ads'

async function fetchAdsData(position) {
  const { data, error } = await fetchAdsForPosition(position)
  // An ad never blocks the page: a failure here degrades to "no ad"
  // (AdBanner already handles an empty list by rendering nothing).
  if (error) return []
  return data ?? []
}

export function useAdsForPosition(position) {
  const { data, isLoading } = useQuery({
    queryKey: ['ads', position],
    queryFn: () => fetchAdsData(position),
    staleTime: 60 * 1000,
  })

  return { ads: data ?? [], loading: isLoading }
}
