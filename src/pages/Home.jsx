import { Newspaper } from 'lucide-react'
import { useHomeNews } from '../hooks/useHomeNews'
import FeaturedNews from '../components/news/FeaturedNews'
import CategorySection from '../components/news/CategorySection'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

function Home() {
  const { featured, latest, loading } = useHomeNews()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!featured.length && !latest.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          icon={Newspaper}
          title="Nenhuma notícia publicada ainda"
          description="Assim que novas notícias forem publicadas, elas aparecem aqui."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8">
      <FeaturedNews items={featured} />
      <CategorySection title="Últimas notícias" items={latest} />
    </div>
  )
}

export default Home
