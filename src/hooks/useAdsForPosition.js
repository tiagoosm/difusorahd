import { useQuery } from '@tanstack/react-query'
import { fetchAdsForPosition } from '../services/ads'

async function fetchAdsData(position) {
  const { data, error } = await fetchAdsForPosition(position)
  // Anúncio nunca bloqueia a página: falha aqui degrada para "sem anúncio"
  // (AdBanner já trata lista vazia não renderizando nada).
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
