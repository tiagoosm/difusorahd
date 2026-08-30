import { Eye, Users, Newspaper, Layers } from 'lucide-react'
import { useAnalyticsPeriod } from '../../hooks/useAnalyticsPeriod'
import { useAnalyticsSummary } from '../../hooks/useAnalyticsSummary'
import { useAnalyticsTimeseries } from '../../hooks/useAnalyticsTimeseries'
import { useAnalyticsBreakdowns } from '../../hooks/useAnalyticsBreakdowns'
import { useAudienceBreakdowns } from '../../hooks/useAudienceBreakdowns'
import { useTopNews } from '../../hooks/useTopNews'
import { useTopPages } from '../../hooks/useTopPages'
import { calcGrowth } from '../../utils/formatNumber'
import PeriodSelector from '../../components/admin/analytics/PeriodSelector'
import RealtimeBadge from '../../components/admin/analytics/RealtimeBadge'
import KpiCard from '../../components/admin/analytics/KpiCard'
import EvolutionChart from '../../components/admin/analytics/EvolutionChart'
import TrafficSourceChart from '../../components/admin/analytics/TrafficSourceChart'
import CategoryPerformanceChart from '../../components/admin/analytics/CategoryPerformanceChart'
import TopNewsList from '../../components/admin/analytics/TopNewsList'
import TopPagesTable from '../../components/admin/analytics/TopPagesTable'
import DeviceBreakdown from '../../components/admin/analytics/DeviceBreakdown'
import LocationBreakdown from '../../components/admin/analytics/LocationBreakdown'
import HourlyChart from '../../components/admin/analytics/HourlyChart'
import DashboardCard from '../../components/ui/DashboardCard'

function Analytics() {
  const { period, customFrom, customTo, range, setPeriod, setCustomRange } = useAnalyticsPeriod()
  const { current, previous, loading } = useAnalyticsSummary(range)
  const timeseries = useAnalyticsTimeseries(range)
  const breakdowns = useAnalyticsBreakdowns(range)
  const audience = useAudienceBreakdowns(range)
  const topNews = useTopNews()
  const topPages = useTopPages(range)

  const viewsGrowth = calcGrowth(current.views, previous.views)

  // Pages viewed per visitor — measures engagement, unlike the other 3
  // cards (which are totals). Guarded: current.visitors=0 avoids a division by zero.
  const currentPagesPerVisitor = current.visitors > 0 ? current.views / current.visitors : 0
  const previousPagesPerVisitor = previous.visitors > 0 ? previous.views / previous.visitors : 0

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Análise</h1>
          <p className="mt-1 text-ink-500">Desempenho de audiência do portal.</p>
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
          label="Engajamento"
          value={Math.round(currentPagesPerVisitor * 10) / 10}
          growth={calcGrowth(currentPagesPerVisitor, previousPagesPerVisitor)}
          icon={Layers}
          loading={loading}
          highlight
          hint="Páginas vistas por visitante, em média, no período selecionado"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCard title="Evolução dos acessos" className="lg:col-span-2">
          <EvolutionChart data={timeseries.data} bucket={timeseries.bucket} loading={timeseries.loading} />
        </DashboardCard>

        <DashboardCard title="Origem do tráfego">
          <TrafficSourceChart data={breakdowns.bySource} loading={breakdowns.loading} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Notícias mais lidas">
          <TopNewsList
            news={topNews.news}
            period={topNews.period}
            onPeriodChange={topNews.setPeriod}
            loading={topNews.loading}
          />
        </DashboardCard>

        <DashboardCard title="Desempenho por categoria">
          <CategoryPerformanceChart data={breakdowns.byCategory} loading={breakdowns.loading} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Dispositivos">
          <DeviceBreakdown
            byDevice={audience.byDevice}
            byOs={audience.byOs}
            byBrowser={audience.byBrowser}
            loading={audience.loading}
          />
        </DashboardCard>

        <DashboardCard title="Localização dos visitantes">
          <LocationBreakdown byLocation={audience.byLocation} loading={audience.loading} />
        </DashboardCard>
      </div>

      <DashboardCard title="Horários de maior acesso">
        <HourlyChart byHour={audience.byHour} loading={audience.loading} />
      </DashboardCard>

      <DashboardCard title="Páginas mais acessadas">
        <TopPagesTable pages={topPages.pages} loading={topPages.loading} />
      </DashboardCard>
    </div>
  )
}

export default Analytics
