import { useAdsForPosition } from '../../hooks/useAdsForPosition'
import { AD_POSITION_LABELS } from '../../utils/adPositions'
import AdCarousel from './AdCarousel'

function AdBanner({ position, className = '' }) {
  const { ads, loading } = useAdsForPosition(position)
  const height = AD_POSITION_LABELS[position]?.height ?? 'h-[180px]'

  if (loading) {
    return <div className={`w-full animate-pulse rounded-xl bg-gray-100 ${height} ${className}`} />
  }

  // Sem anúncio válido para essa posição: não reserva espaço, o layout
  // ao redor se reorganiza normalmente (decisão de produto).
  if (ads.length === 0) return null

  // Um único anúncio não precisa da máquina do carrossel.
  if (ads.length === 1) {
    const ad = ads[0]
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={ad.title}
        className={`block overflow-hidden rounded-xl border border-gray-200 transition-opacity hover:opacity-90 ${className}`}
      >
        <img src={ad.image_url} alt={ad.title} loading="lazy" className={`w-full object-cover ${height}`} />
      </a>
    )
  }

  return <AdCarousel ads={ads} position={position} className={className} />
}

export default AdBanner
