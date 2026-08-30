// Skeleton with the article page's silhouette (kicker, title, thin line,
// cover, body). Replaces the centered Spinner, which gave no hint of the
// content's shape and caused a big jump when the text arrived.
function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:py-12" aria-hidden="true">
      <div className="flex flex-col gap-4">
        <div className="h-3.5 w-24 animate-pulse rounded bg-ink-100" />

        <div className="flex flex-col gap-3">
          <div className="h-9 w-full animate-pulse rounded bg-ink-100 sm:h-11" />
          <div className="h-9 w-4/5 animate-pulse rounded bg-ink-100 sm:h-11" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-5 w-full animate-pulse rounded bg-ink-100" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-ink-100" />
        </div>

        <div className="flex gap-4">
          <div className="h-4 w-28 animate-pulse rounded bg-ink-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-ink-100" />
        </div>
      </div>

      <div className="mt-8 aspect-[16/9] w-full animate-pulse rounded-2xl bg-ink-100" />

      <div className="mt-10 flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded bg-ink-100 ${index % 4 === 3 ? 'w-3/5' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ArticleSkeleton
