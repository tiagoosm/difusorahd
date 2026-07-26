import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

function AdCarousel({ ads, className = '' }) {
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
            <img src={ad.image_url} alt={ad.title} loading="lazy" className="h-auto w-full object-cover" />
          </a>
        ))}
      </div>
    </div>
  )
}

export default AdCarousel
