import { useAdsForPosition } from '../../hooks/useAdsForPosition'
import AdCarousel from './AdCarousel'

function AdBanner({ position, className = '' }) {
  const { ads, loading } = useAdsForPosition(position)

  if (loading) {
    return <div className={`h-24 w-full animate-pulse rounded-xl bg-gray-100 ${className}`} />
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
        <img src={ad.image_url} alt={ad.title} loading="lazy" className="h-auto w-full object-cover" />
      </a>
    )
  }

  return <AdCarousel ads={ads} className={className} />
}

export default AdBanner
