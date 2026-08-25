// Esqueleto com a mesma silhueta do layout real (hero + lista + ranking) em
// vez de um spinner centralizado — evita o "salto" de layout quando os dados
// chegam e passa uma sensação de carregamento mais premium.
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

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="h-7 w-44 animate-pulse rounded bg-ink-100" />
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <div className="aspect-video w-full animate-pulse rounded-xl bg-ink-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-ink-100" />
                <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="h-7 w-32 animate-pulse rounded bg-ink-100" />
          <div className="flex flex-col divide-y divide-ink-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 py-3.5">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-ink-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-ink-100" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
