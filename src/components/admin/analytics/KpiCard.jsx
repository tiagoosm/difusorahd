import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatNumber } from '../../../utils/formatNumber'

function Trend({ growth }) {
  if (growth === undefined) {
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Novo</span>
  }

  const isUp = growth > 0.05
  const isDown = growth < -0.05
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const tone = isUp ? 'text-green-600 bg-green-50' : isDown ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      <Icon className="h-3 w-3" />
      {growth > 0 ? '+' : ''}
      {growth.toFixed(1).replace('.', ',')}%
    </span>
  )
}

function KpiCard({ label, value, growth, icon: Icon, loading, hint, highlight = false }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-5 shadow-card ${
        highlight ? 'border-brand-200 bg-brand-50' : 'border-gray-200 bg-white'
      }`}
      title={hint}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <p className={`text-2xl font-semibold ${highlight ? 'text-brand-700' : 'text-gray-900'}`}>
        {formatNumber(value)}
      </p>
      <Trend growth={growth} />
    </div>
  )
}

export default KpiCard
