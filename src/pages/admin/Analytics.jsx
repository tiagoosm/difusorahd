import { Eye, Users, Newspaper, TrendingUp } from 'lucide-react'
import { useAnalyticsPeriod } from '../../hooks/useAnalyticsPeriod'
import { useAnalyticsSummary } from '../../hooks/useAnalyticsSummary'
import { calcGrowth } from '../../utils/formatNumber'
import PeriodSelector from '../../components/admin/analytics/PeriodSelector'
import RealtimeBadge from '../../components/admin/analytics/RealtimeBadge'
import KpiCard from '../../components/admin/analytics/KpiCard'

function Analytics() {
  const { period, customFrom, customTo, range, setPeriod, setCustomRange } = useAnalyticsPeriod()
  const { current, previous, loading } = useAnalyticsSummary(range)

  const viewsGrowth = calcGrowth(current.views, previous.views)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Análise</h1>
          <p className="mt-1 text-gray-500">Desempenho de audiência do portal.</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <RealtimeBadge />
          <PeriodSelector
            period={period}
            customFrom={customFrom}
            customTo={customTo}
            onPeriodChange={setPeriod}
            onCustomRangeChange={setCustomRange}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Visualizações"
          value={current.views}
          growth={viewsGrowth}
          icon={Eye}
          loading={loading}
          hint="Total de page views no período selecionado"
        />
        <KpiCard
          label="Visitantes"
          value={current.visitors}
          growth={calcGrowth(current.visitors, previous.visitors)}
          icon={Users}
          loading={loading}
          hint="Visitantes únicos (aproximado) no período selecionado"
        />
        <KpiCard
          label="Notícias publicadas"
          value={current.news}
          growth={calcGrowth(current.news, previous.news)}
          icon={Newspaper}
          loading={loading}
          hint="Notícias publicadas dentro do período selecionado"
        />
        <KpiCard
          label="Crescimento"
          value={current.views}
          growth={viewsGrowth}
          icon={TrendingUp}
          loading={loading}
          highlight
          hint="Variação de visualizações em relação ao período anterior equivalente"
        />
      </div>
    </div>
  )
}

export default Analytics
