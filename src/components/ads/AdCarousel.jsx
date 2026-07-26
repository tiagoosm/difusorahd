import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { AD_POSITION_LABELS } from '../../utils/adPositions'

function AdCarousel({ ads, position, className = '' }) {
  const height = AD_POSITION_LABELS[position]?.height ?? 'h-[180px]'

  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false }),
  ])

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`} ref={emblaRef}>
      <div className="flex">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={ad.title}
            className="relative min-w-0 flex-[0_0_100%] transition-opacity hover:opacity-90"
          >
            <img src={ad.image_url} alt={ad.title} loading="lazy" className={`w-full object-cover ${height}`} />
          </a>
        ))}
      </div>
    </div>
  )
}

export default AdCarousel
