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
  const { featured, latest, latestFiller, mostRead, loading } = useHomeNews()

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
          {/* Uma única grid pras duas seções (em vez de duas grids
              independentes lado a lado) — é o que permite o card de
              preenchimento de "Mais Lidas" alinhar de verdade com a última
              linha de "Últimas notícias" em vez de só flutuar abaixo da
              lista. Ver LatestNewsList/MostReadNews: cada item se posiciona
              explicitamente (linha/coluna) nesta mesma grid. */}
          <div className="grid gap-8 lg:grid-cols-3 lg:items-start lg:gap-10">
            <LatestNewsList title="Últimas notícias" items={latest} />
            <MostReadNews items={mostRead} moreItems={latestFiller} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
