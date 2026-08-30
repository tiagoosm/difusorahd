import { Newspaper } from 'lucide-react'
import { useHomeNews } from '../hooks/useHomeNews'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/seo'
import { buildPath } from '../routes/paths'
import FeaturedNews from '../components/news/FeaturedNews'
import LatestNewsList from '../components/news/LatestNewsList'
import CategorySection from '../components/news/CategorySection'
import MostReadNews from '../components/news/MostReadNews'
import AdBanner from '../components/ads/AdBanner'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import HomeSkeleton from '../components/news/HomeSkeleton'

function Home() {
  const { featured, latest, categorySections, mostRead, loading, error, retry } = useHomeNews()

  useSEO({ title: SITE_NAME, description: SITE_DESCRIPTION })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:py-8 lg:py-10">
      <AdBanner position="TOP_HOME" />

      {loading ? (
        <HomeSkeleton />
      ) : error ? (
        <ErrorState onRetry={retry} />
      ) : !featured.length && !latest.length ? (
        <EmptyState
          icon={Newspaper}
          title="Nenhuma notícia publicada ainda"
          description="Assim que novas notícias forem publicadas, elas aparecem aqui."
        />
      ) : (
        // Ordem editorial: Destaques → Últimas notícias (9) → uma seção por
        // categoria existente (dinâmico, ver useHomeNews) → Mais Lidas, por
        // último. Mesma largura/grid/espaçamento em todas as seções (este
        // container único), pra Home inteira parecer construída sobre a
        // mesma grade visual em vez de blocos independentes.
        <div className="flex flex-col gap-12">
          <FeaturedNews items={featured} />
          <AdBanner position="HOME_MIDDLE" />

          <LatestNewsList title="Últimas notícias" items={latest} />

          {categorySections.map(({ category, items }) => (
            <CategorySection
              key={category.id}
              title={category.name}
              items={items}
              viewAllHref={buildPath.category(category.slug)}
            />
          ))}

          <MostReadNews items={mostRead} />
        </div>
      )}
    </div>
  )
}

export default Home
