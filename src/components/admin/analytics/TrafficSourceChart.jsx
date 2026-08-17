import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber } from '../../../utils/formatNumber'
import { CHART_COLORS } from '../../../utils/chartColors'

function TrafficSourceChart({ data, loading }) {
  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  if (data.length === 0) {
    return <div className="flex h-32 items-center justify-center text-sm text-ink-500">Sem dados no período.</div>
  }

  const total = data.reduce((sum, row) => sum + Number(row.views), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="views"
              nameKey="source"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.source} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${formatNumber(value)} (${((value / total) * 100).toFixed(1)}%)`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-col gap-2">
        {data.map((row, index) => (
          <li key={row.source} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="truncate text-ink-700">{row.source}</span>
            </span>
            <span className="shrink-0 text-ink-500">
              {formatNumber(row.views)} · {((row.views / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TrafficSourceChart
