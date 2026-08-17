import { useRealtimeVisitors } from '../../../hooks/useRealtimeVisitors'

function RealtimeBadge() {
  const count = useRealtimeVisitors()

  if (count === null) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-600 shadow-card">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <strong className="font-semibold text-ink-900">{count}</strong> agora
    </span>
  )
}

export default RealtimeBadge
