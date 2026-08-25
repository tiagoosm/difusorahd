// Esqueleto com a silhueta do NewsCard, para as grades de Categoria e Busca.
// Antes a Categoria mostrava só um Spinner centralizado (e a Busca tinha o
// próprio esqueleto inline duplicado) — o esqueleto evita o "salto" de layout
// quando os dados chegam e mantém o mesmo padrão de loading da Home.
function CardGridSkeleton({ count = 9, withHeader = false }) {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {withHeader && (
        <div className="flex flex-col gap-2 border-b-2 border-ink-100 pb-5">
          <div className="h-9 w-52 animate-pulse rounded bg-ink-100" />
          <div className="h-4 w-72 animate-pulse rounded bg-ink-100" />
        </div>
      )}

      <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white"
          >
            <div className="aspect-video animate-pulse bg-ink-100" />
            <div className="flex flex-col gap-2.5 p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
              <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100" />
              <div className="mt-3 h-3 w-24 animate-pulse rounded bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardGridSkeleton
