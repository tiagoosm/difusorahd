// Esqueleto com a mesma silhueta do layout real (destaques + últimas +
// categoria + mais lidas) em vez de um spinner centralizado — evita o
// "salto" de layout quando os dados chegam e passa uma sensação de
// carregamento mais premium. O número de seções de categoria é dinâmico no
// real (uma por categoria existente) — aqui mostramos só 1 como indicativo,
// já que o esqueleto não sabe quantas categorias existem antes de carregar.
function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden="true">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[22rem] animate-pulse rounded-2xl bg-ink-100 lg:col-span-2" />
        <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <RowSkeleton key={index} imageClassName="h-20 w-20" />
          ))}
        </div>
      </div>

      <CardGridSectionSkeleton titleWidth="w-44" count={9} />

      <CardGridSectionSkeleton titleWidth="w-32" count={3} />

      <div className="flex flex-col gap-5">
        <div className="h-7 w-32 animate-pulse rounded bg-ink-100" />
        <div className="grid gap-x-10 sm:grid-cols-2">
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, index) => (
              <RowSkeleton key={index} imageClassName="h-14 w-14" className="py-3.5" />
            ))}
          </div>
          <div className="hidden flex-col sm:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <RowSkeleton key={index} imageClassName="h-14 w-14" className="py-3.5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CardGridSectionSkeleton({ titleWidth, count }) {
  return (
    <div className="flex flex-col gap-5">
      <div className={`h-7 animate-pulse rounded bg-ink-100 ${titleWidth}`} />
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="aspect-video w-full animate-pulse rounded-xl bg-ink-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-ink-100" />
            <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

function RowSkeleton({ imageClassName, className = '' }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className={`shrink-0 animate-pulse rounded-xl bg-ink-100 ${imageClassName}`} />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-ink-100" />
        <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
        <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
      </div>
    </div>
  )
}

export default HomeSkeleton
