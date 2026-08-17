function StatsCard({ label, value, icon: Icon, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-ink-100" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-16 animate-pulse rounded bg-ink-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-ink-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink-900">{value}</p>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
    </div>
  )
}

export default StatsCard
