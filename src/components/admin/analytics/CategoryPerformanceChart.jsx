import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatNumber } from '../../../utils/formatNumber'
import { CHART_COLORS, CHART_GRID_COLOR, CHART_AXIS_COLOR } from '../../../utils/chartColors'

function CategoryPerformanceChart({ data, loading }) {
  if (loading) {
    return <div className="h-72 w-full animate-pulse rounded-lg bg-gray-100" />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        Sem visualizações em notícias no período selecionado.
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatNumber}
          />
          <YAxis
            type="category"
            dataKey="category_name"
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            formatter={(value) => formatNumber(value)}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="views" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry, index) => (
              <Cell key={entry.category_id} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryPerformanceChart
