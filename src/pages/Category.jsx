import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { useCategoryNews } from '../hooks/useCategoryNews'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME } from '../utils/seo'
import { ROUTES } from '../routes/paths'
import NewsCard from '../components/news/NewsCard'
import NewsRow from '../components/news/NewsRow'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

function Category() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { category, news, totalCount, pageSize, loading, notFound } = useCategoryNews(slug, page)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useSEO({
    title: category ? `${category.name} — ${SITE_NAME}` : undefined,
    description: category?.description || `Notícias sobre ${category?.name}.`,
  })

  function handlePageChange(nextPage) {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
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

  // Só a primeira página abre com um item em destaque (imagem+texto maior) —
  // em páginas seguintes isso não seria "o assunto do momento" e sim só
  // paginação, então tudo entra na grade normal.
  const featuredItem = page === 1 ? news[0] : null
  const gridItems = page === 1 ? news.slice(1) : news

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
      <header className="flex flex-col gap-2 border-b-2 border-ink-900 pb-5">
        <span className="text-xs font-bold tracking-wide text-brand-600 uppercase">Categoria</span>
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
          {category.name}
        </h1>
        {category.description && <p className="max-w-2xl text-ink-500">{category.description}</p>}
        <p className="text-sm text-ink-500">
          {totalCount} notícia{totalCount === 1 ? '' : 's'}
        </p>
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
            <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default Category
