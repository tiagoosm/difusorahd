import { Link } from 'react-router-dom'
import { Newspaper, Eye, FolderKanban, FileText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { buildPath, ROUTES } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import StatsCard from '../../components/ui/StatsCard'
import DashboardCard from '../../components/ui/DashboardCard'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function Dashboard() {
  const { profile } = useAuth()
  const { stats, recentNews, loading } = useDashboardStats()

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Bem-vindo, {profile?.full_name || 'Administrador'}.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Notícias publicadas" value={stats.published} icon={Newspaper} />
            <StatsCard label="Rascunhos" value={stats.drafts} icon={FileText} />
            <StatsCard label="Categorias" value={stats.categories} icon={FolderKanban} />
            <StatsCard label="Visualizações totais" value={stats.totalViews} icon={Eye} />
          </div>

          <DashboardCard
            title="Notícias recentes"
            action={
              <Link to={ROUTES.adminNews} className="text-sm font-medium text-brand-600 hover:underline">
                Ver todas
              </Link>
            }
          >
            {recentNews.length === 0 ? (
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
        </>
      )}
    </div>
  )
}

export default Dashboard
