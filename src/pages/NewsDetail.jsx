import { useParams, Link } from 'react-router-dom'
import { Headphones, User, Clock } from 'lucide-react'
import { useNewsDetail } from '../hooks/useNewsDetail'
import { useSEO } from '../hooks/useSEO'
import { formatDate } from '../utils/formatDate'
import { estimateReadingTime } from '../utils/readingTime'
import { ROUTES, buildPath } from '../routes/paths'
import Eyebrow from '../components/ui/Eyebrow'
import AudioPlayer from '../components/ui/AudioPlayer'
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

  const readingMinutes = estimateReadingTime(news.content)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:py-12">
      <AdBanner position="ARTICLE_TOP" className="mb-8" />

      <article>
        <header className="flex flex-col gap-4">
          {news.category?.name && (
            <Eyebrow to={buildPath.category(news.category.slug)}>{news.category.name}</Eyebrow>
          )}

          <h1 className="text-3xl leading-[1.08] font-bold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
            {news.title}
          </h1>

          {news.excerpt && (
            <p className="text-lg leading-relaxed font-normal text-ink-600 sm:text-xl">{news.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
            {news.author?.full_name && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {news.author.full_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />
              {formatDate(news.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />
              <Clock className="h-3.5 w-3.5" />
              {readingMinutes} min de leitura
            </span>
          </div>

          <div className="border-t border-ink-100 pt-4">
            <ShareButtons title={news.title} url={window.location.href} />
          </div>
        </header>

        {news.cover_image_url && (
          <figure className="mt-8">
            <div className="overflow-hidden rounded-2xl bg-ink-100 shadow-card">
              <img src={news.cover_image_url} alt={news.title} className="w-full object-cover" />
            </div>
            {news.cover_image_caption && (
              <figcaption className="mt-2 text-xs text-ink-400 italic">
                {news.cover_image_caption}
              </figcaption>
            )}
          </figure>
        )}

        {news.audio_url && (
          <div className="mt-8 flex flex-col gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-ink-500 uppercase">
              <Headphones className="h-3.5 w-3.5" />
              Ouça esta notícia
            </span>
            <AudioPlayer src={news.audio_url} />
          </div>
        )}

        <div
          className="article-prose prose prose-lg mt-10 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <AdBanner position="ARTICLE_BOTTOM" className="mt-10" />

        {related.length > 0 && (
          <div className="mt-16 border-t border-ink-100 pt-10">
            <CategorySection title="Notícias relacionadas" items={related} />
          </div>
        )}
      </article>
    </div>
  )
}

export default NewsDetail
