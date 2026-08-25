// Esqueleto com a silhueta do NewsCard, para as grades de Categoria e Busca.
// Abaixo de sm reproduz a linha compacta (miniatura + texto); em sm+, o card
// vertical — mesma dualidade responsiva do NewsCard real, pra não "saltar"
// de formato quando os dados chegam.
function CardGridSkeleton({ count = 9, withHeader = false }) {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {withHeader && (
        <div className="flex flex-col gap-2 border-b-2 border-ink-100 pb-5">
          <div className="h-9 w-52 animate-pulse rounded bg-ink-100" />
          <div className="h-4 w-72 animate-pulse rounded bg-ink-100" />
        </div>
      )}

      <div className="grid items-start gap-1 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex gap-3 border-b border-ink-100 pb-4 last:border-b-0 last:pb-0 sm:flex-col sm:overflow-hidden sm:rounded-xl sm:border sm:border-ink-200 sm:bg-white sm:pb-0"
          >
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-ink-100 sm:h-auto sm:w-full sm:aspect-video sm:rounded-none" />
            <div className="flex flex-1 flex-col justify-center gap-1.5 sm:justify-start sm:gap-2.5 sm:p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
              <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
              <div className="hidden h-4 w-2/3 animate-pulse rounded bg-ink-100 sm:block" />
              <div className="h-3 w-24 animate-pulse rounded bg-ink-100 sm:mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardGridSkeleton
