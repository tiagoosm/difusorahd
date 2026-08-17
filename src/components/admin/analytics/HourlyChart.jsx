import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber } from '../../../utils/formatNumber'
import { CHART_GRID_COLOR, CHART_AXIS_COLOR } from '../../../utils/chartColors'

// A função SQL só devolve horas com pelo menos 1 view — preenche as demais
// com 0 para o eixo sempre mostrar as 24h corridas.
function fillHours(byHour) {
  const map = new Map(byHour.map((row) => [row.hour, Number(row.views)]))
  return Array.from({ length: 24 }, (_, hour) => ({ hour, views: map.get(hour) ?? 0 }))
}

function HourlyChart({ byHour, loading }) {
  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  const data = fillHours(byHour)

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="hour"
            tickFormatter={(hour) => `${hour}h`}
            tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
            axisLine={{ stroke: CHART_GRID_COLOR }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatNumber}
            width={40}
          />
          <Tooltip
            labelFormatter={(hour) => `${hour}h`}
            formatter={(value) => [formatNumber(value), 'Visualizações']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="views" fill="var(--color-brand-600)" radius={[3, 3, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HourlyChart
