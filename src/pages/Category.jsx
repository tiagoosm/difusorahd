import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { useCategoryNews } from '../hooks/useCategoryNews'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME } from '../utils/seo'
import { ROUTES, buildPath } from '../routes/paths'
import NewsCard from '../components/news/NewsCard'
import NewsRow from '../components/news/NewsRow'
import NumberedPagination from '../components/ui/NumberedPagination'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import CardGridSkeleton from '../components/news/CardGridSkeleton'

function Category() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { category, news, totalPages, loading, notFound, error, retry } = useCategoryNews(slug, page)

  useSEO({
    title: category ? `${category.name} — ${SITE_NAME}` : undefined,
    description: category?.description || `Notícias sobre ${category?.name}.`,
  })

  // Page 1 has no `?page=` at all — keeps the canonical/most-shared URL clean.
  function buildPageHref(pageNumber) {
    const base = buildPath.category(slug)
    return pageNumber <= 1 ? base : `${base}?page=${pageNumber}`
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
        <CardGridSkeleton withHeader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ErrorState onRetry={retry} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          title="Categoria não encontrada"
          description="Verifique o link ou volte para a Home."
        />
        <div className="mt-6 text-center">
          <Link to={ROUTES.home} className="text-sm font-medium text-brand-600 hover:underline">
            Voltar para a Home
          </Link>
        </div>
      </div>
    )
  }

  // Only the first page opens with a featured item — it's "this
  // category's current top story", which only makes sense once, not once
  // per page (see useCategoryNews.js for how page 1's extra row and the
  // 15-per-page grid afterward both avoid a trailing empty grid cell).
  const featuredItem = page === 1 ? news[0] : null
  const gridItems = page === 1 ? news.slice(1) : news

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
      <header className="flex flex-col gap-2 border-b-2 border-ink-900 pb-5">
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
          {category.name}
        </h1>
        {category.description && <p className="max-w-2xl text-ink-500">{category.description}</p>}
      </header>

      {news.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Nenhuma notícia nesta categoria ainda"
          description="Volte em breve para conferir novidades."
        />
      ) : (
        <>
          {featuredItem && (
            <div className="border-b border-ink-100 pb-2">
              <NewsRow news={featuredItem} size="lg" />
            </div>
          )}

          {gridItems.length > 0 && (
            // Below sm, NewsCard is already a row with its own border (see
            // NewsCard.jsx) — gap-6 there would just duplicate the spacing.
            // items-stretch: cards in the same row end up the same height.
            <div className="grid items-stretch gap-1 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          )}

          <NumberedPagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
        </>
      )}
    </div>
  )
}

export default Category
