import { useAdsForPosition } from '../../hooks/useAdsForPosition'
import { AD_POSITION_LABELS } from '../../utils/adPositions'
import AdCarousel from './AdCarousel'

const LABEL_TONE = {
  light: 'text-gray-400',
  dark: 'text-white/40',
}

// Anúncios precisam se diferenciar claramente de conteúdo editorial na
// hierarquia visual — daí o rótulo "Publicidade" acima do banner.
function AdBanner({ position, className = '', variant = 'light' }) {
  const { ads, loading } = useAdsForPosition(position)
  const height = AD_POSITION_LABELS[position]?.height ?? 'h-[180px]'

  if (loading) {
    return <div className={`w-full animate-pulse rounded-xl bg-gray-100 ${height} ${className}`} />
  }

  // Sem anúncio válido para essa posição: não reserva espaço, o layout
  // ao redor se reorganiza normalmente (decisão de produto).
  if (ads.length === 0) return null

  return (
    <div className={className}>
      <span className={`mb-1.5 block text-[10px] font-semibold tracking-wider uppercase ${LABEL_TONE[variant]}`}>
        Publicidade
      </span>

      {/* Um único anúncio não precisa da máquina do carrossel. */}
      {ads.length === 1 ? (
        <a
          href={ads[0].link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={ads[0].title}
          className="block overflow-hidden rounded-xl border border-gray-200 transition-opacity hover:opacity-90"
        >
          <img src={ads[0].image_url} alt={ads[0].title} loading="lazy" className={`w-full object-cover ${height}`} />
        </a>
      ) : (
        <AdCarousel ads={ads} position={position} />
      )}
    </div>
  )
}

export default AdBanner
