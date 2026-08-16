import { Newspaper } from 'lucide-react'
import { useHomeNews } from '../hooks/useHomeNews'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/seo'
import FeaturedNews from '../components/news/FeaturedNews'
import LatestNewsList from '../components/news/LatestNewsList'
import MostReadNews from '../components/news/MostReadNews'
import AdBanner from '../components/ads/AdBanner'
import EmptyState from '../components/ui/EmptyState'
import HomeSkeleton from '../components/news/HomeSkeleton'

function Home() {
  const { featured, latest, mostRead, loading } = useHomeNews()

  useSEO({ title: SITE_NAME, description: SITE_DESCRIPTION })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:py-8 lg:py-10">
      <AdBanner position="TOP_HOME" />

      {loading ? (
        <HomeSkeleton />
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
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <LatestNewsList title="Últimas notícias" items={latest} />
            </div>
            <MostReadNews items={mostRead} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
