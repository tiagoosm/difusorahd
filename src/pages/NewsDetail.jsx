import { useParams, Link } from 'react-router-dom'
import { Headphones } from 'lucide-react'
import { useNewsDetail } from '../hooks/useNewsDetail'
import { useSEO } from '../hooks/useSEO'
import { formatDate } from '../utils/formatDate'
import { ROUTES } from '../routes/paths'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ShareButtons from '../components/news/ShareButtons'
import CategorySection from '../components/news/CategorySection'
import AdBanner from '../components/ads/AdBanner'

function NewsDetail() {
  const { slug } = useParams()
  const { news, related, loading, notFound } = useNewsDetail(slug)

  useSEO({
    title: news ? `${news.title} — Difusora HD` : undefined,
    description: news?.excerpt,
    image: news?.cover_image_url,
  })

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
          title="Notícia não encontrada"
          description="Ela pode ter sido removida ou o link está incorreto."
        />
        <div className="mt-6 text-center">
          <Link to={ROUTES.home} className="text-sm font-medium text-brand-600 hover:underline">
            Voltar para a Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:py-12">
      {/* Acima de tudo, inclusive da categoria e do título. */}
      <AdBanner position="ARTICLE_TOP" className="mb-6" />

      <article>
        <header className="flex flex-col gap-3">
          {news.category?.name && <Badge>{news.category.name}</Badge>}
          <h1 className="text-3xl leading-tight font-semibold text-gray-900 sm:text-4xl">
            {news.title}
          </h1>
          {news.excerpt && <p className="text-lg leading-relaxed text-gray-500">{news.excerpt}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-gray-200 py-3 text-sm text-gray-500">
            {news.author?.full_name && <span>Por {news.author.full_name}</span>}
            <span>{formatDate(news.published_at)}</span>
          </div>

          <ShareButtons title={news.title} url={window.location.href} />
        </header>

        {news.cover_image_url && (
          <figure className="mt-8">
            <div className="overflow-hidden rounded-xl bg-gray-100">
              <img src={news.cover_image_url} alt={news.title} className="w-full object-cover" />
            </div>
            {news.cover_image_caption && (
              <figcaption className="mt-2 text-xs text-gray-500 italic">
                {news.cover_image_caption}
              </figcaption>
            )}
          </figure>
        )}

        {news.audio_url && (
          <div className="mt-8 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-card">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Headphones className="h-4 w-4" />
              Ouça esta notícia
            </span>
            <audio src={news.audio_url} controls className="w-full" />
          </div>
        )}

        <div
          className="prose prose-gray mt-10 max-w-none prose-headings:font-semibold prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <AdBanner position="ARTICLE_BOTTOM" className="mt-10" />

        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-10">
            <CategorySection title="Notícias relacionadas" items={related} />
          </div>
        )}
      </article>
    </div>
  )
}

export default NewsDetail
