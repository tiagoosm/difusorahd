import { useActiveAd } from '../../hooks/useActiveAd'

function AdBanner({ position, className = '' }) {
  const { ad, loading } = useActiveAd(position)

  if (loading) {
    return <div className={`h-24 w-full animate-pulse rounded-xl bg-gray-100 ${className}`} />
  }

  // Sem anúncio válido para essa posição: não reserva espaço, o layout
  // ao redor se reorganiza normalmente (decisão de produto).
  if (!ad) return null

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

export default AdBanner
