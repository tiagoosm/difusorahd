import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, FileText, FileStack, Eye, Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useAnalyticsTimeseries } from '../../hooks/useAnalyticsTimeseries'
import { buildPath, ROUTES } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { calcGrowth } from '../../utils/formatNumber'
import { getPeriodRange } from '../../utils/analyticsPeriods'
import StatsCard from '../../components/ui/StatsCard'
import DashboardCard from '../../components/ui/DashboardCard'
import KpiCard from '../../components/admin/analytics/KpiCard'
import EvolutionChart from '../../components/admin/analytics/EvolutionChart'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const CHART_PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'last7', label: '7 dias' },
  { value: 'last30', label: '30 dias' },
]

function Dashboard() {
  const { profile } = useAuth()
  const { newsStats, today, yesterday, last7, previous7, recentNews, loading } = useDashboardStats()
  const [chartPeriod, setChartPeriod] = useState('last7')
  const chartRange = getPeriodRange(chartPeriod)
  const timeseries = useAnalyticsTimeseries(chartRange)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Bem-vindo, {profile?.full_name || 'Administrador'}.</p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">Conteúdo</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total de notícias" value={newsStats.total} icon={FileStack} loading={loading} />
          <StatsCard label="Publicadas" value={newsStats.published} icon={Newspaper} loading={loading} />
          <StatsCard label="Rascunhos" value={newsStats.drafts} icon={FileText} loading={loading} />
          <StatsCard label="Visualizações totais" value={newsStats.totalViews} icon={Eye} loading={loading} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">Audiência</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Visualizações hoje"
            value={today.views}
            growth={calcGrowth(today.views, yesterday.views)}
            icon={Eye}
            loading={loading}
            hint="Comparado com ontem"
          />
          <KpiCard
            label="Visitantes hoje"
            value={today.visitors}
            growth={calcGrowth(today.visitors, yesterday.visitors)}
            icon={Users}
            loading={loading}
            hint="Comparado com ontem"
          />
          <KpiCard
            label="Visualizações (7 dias)"
            value={last7.views}
            growth={calcGrowth(last7.views, previous7.views)}
            icon={Eye}
            loading={loading}
            hint="Comparado com os 7 dias anteriores"
          />
          <KpiCard
            label="Visitantes (7 dias)"
            value={last7.visitors}
            growth={calcGrowth(last7.visitors, previous7.visitors)}
            icon={Users}
            loading={loading}
            hint="Comparado com os 7 dias anteriores"
          />
        </div>
      </div>

      <DashboardCard
        title="Evolução das visualizações"
        action={
          <div className="flex gap-1.5">
            {CHART_PERIODS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setChartPeriod(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  chartPeriod === option.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      >
        <EvolutionChart data={timeseries.data} bucket={timeseries.bucket} loading={timeseries.loading} />
      </DashboardCard>

      <DashboardCard
        title="Notícias recentes"
        action={
          <Link to={ROUTES.adminNews} className="text-sm font-medium text-brand-600 hover:underline">
            Ver todas
          </Link>
        }
      >
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-6 w-full animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : recentNews.length === 0 ? (
          <EmptyState title="Nenhuma notícia cadastrada ainda" />
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {recentNews.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <Link
                  to={buildPath.adminNewsEdit(item.id)}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 hover:text-brand-600"
                >
                  {item.title}
                </Link>
                <Badge tone={item.status === 'published' ? 'green' : 'gray'}>
                  {item.status === 'published' ? 'Publicada' : 'Rascunho'}
                </Badge>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(item.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  )
}

export default Dashboard
