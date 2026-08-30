import { useAdsForPosition } from '../../hooks/useAdsForPosition'
import { AD_POSITION_LABELS } from '../../utils/adPositions'
import AdCarousel from './AdCarousel'

const LABEL_TONE = {
  light: 'text-ink-500',
  dark: 'text-white/70',
}

// Ads need to be clearly distinguishable from editorial content in the
// visual hierarchy — hence the "Advertising" label above the banner.
function AdBanner({ position, className = '', variant = 'light' }) {
  const { ads, loading } = useAdsForPosition(position)
  const height = AD_POSITION_LABELS[position]?.height ?? 'h-[180px]'

  if (loading) {
    return <div className={`w-full animate-pulse rounded-xl bg-ink-100 ${height} ${className}`} />
  }

  // No valid ad for this position: doesn't reserve any space, the
  // surrounding layout reflows normally (product decision).
  if (ads.length === 0) return null

  return (
    <div className={className}>
      <span className={`mb-1.5 block text-[10px] font-semibold tracking-wider uppercase ${LABEL_TONE[variant]}`}>
        Publicidade
      </span>

      {/* A single ad doesn't need the carousel machinery. */}
      {ads.length === 1 ? (
        <a
          href={ads[0].link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={ads[0].title}
          className="block overflow-hidden rounded-xl border border-ink-200 transition-opacity hover:opacity-90"
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
