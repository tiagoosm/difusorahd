import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber } from '../../../utils/formatNumber'
import { CHART_GRID_COLOR, CHART_AXIS_COLOR } from '../../../utils/chartColors'
import ErrorState from '../../ui/ErrorState'

function formatBucketLabel(isoValue, bucket) {
  const date = new Date(isoValue)
  if (bucket === 'hour') {
    return `${String(date.getHours()).padStart(2, '0')}h`
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function TooltipContent({ active, payload, bucket }) {
  if (!active || !payload?.length) return null
  const { bucket: rawBucket, views, visitors } = payload[0].payload

  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-ink-900">{formatBucketLabel(rawBucket, bucket)}</p>
      <p className="text-ink-500">{formatNumber(views)} visualizações</p>
      <p className="text-ink-500">{formatNumber(visitors)} visitantes</p>
    </div>
  )
}

function EvolutionChart({ data, bucket, loading, error, onRetry }) {
  if (loading) {
    return <div className="h-72 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  if (error) {
    return (
      <div className="flex h-72 items-center">
        <ErrorState
          title="Não foi possível carregar o gráfico"
          description="Verifique sua conexão e tente novamente."
          onRetry={onRetry}
        />
      </div>
    )
  }

  // Not data.length === 0: analytics_timeseries always returns one row per
  // bucket in the range, zero-filled (see the Supabase function) — an
  // all-zero period still has exactly as many rows as a busy one. Checking
  // the actual total is what distinguishes "no activity" from "activity,
  // rendered" (an all-zero chart would otherwise draw a flat line against
  // a meaningless 0-4 axis instead of this message).
  const hasAnyViews = data.some((point) => point.views > 0)
  if (!hasAnyViews) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-ink-500">
        Nenhuma visualização registrada neste período.
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="evolutionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-600)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="bucket"
            tickFormatter={(value) => formatBucketLabel(value, bucket)}
            tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
            axisLine={{ stroke: CHART_GRID_COLOR }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatNumber}
            width={40}
          />
          <Tooltip content={<TooltipContent bucket={bucket} />} />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--color-brand-600)"
            strokeWidth={2}
            fill="url(#evolutionFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EvolutionChart
