import { Newspaper } from 'lucide-react'
import { useHomeNews } from '../hooks/useHomeNews'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/seo'
import FeaturedNews from '../components/news/FeaturedNews'
import CategorySection from '../components/news/CategorySection'
import MostReadNews from '../components/news/MostReadNews'
import AdBanner from '../components/ads/AdBanner'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

function Home() {
  const { featured, latest, mostRead, loading } = useHomeNews()

  useSEO({ title: SITE_NAME, description: SITE_DESCRIPTION })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
      <AdBanner position="TOP_HOME" />

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner />
        </div>
      ) : !featured.length && !latest.length ? (
        <EmptyState
          icon={Newspaper}
          title="Nenhuma notícia publicada ainda"
          description="Assim que novas notícias forem publicadas, elas aparecem aqui."
        />
      ) : (
        <div className="flex flex-col gap-12">
          <FeaturedNews items={featured} />
          <AdBanner position="HOME_MIDDLE" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CategorySection title="Últimas notícias" items={latest} columns={2} />
            </div>
            <MostReadNews items={mostRead} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
