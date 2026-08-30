import { formatNumber } from '../../../utils/formatNumber'
import EmptyState from '../../ui/EmptyState'

// "Average time on page" isn't collected today (it would require measuring
// each visit's exit moment, out of scope for this stage) — the column
// exists just to make that limitation explicit, instead of making up a value.
function TopPagesTable({ pages, loading }) {
  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  if (pages.length === 0) {
    return <EmptyState title="Nenhum acesso registrado no período" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink-200 text-ink-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Página</th>
            <th className="py-2 pr-4 font-medium">Visualizações</th>
            <th className="py-2 pr-4 font-medium">Visitantes</th>
            <th className="py-2 font-medium">Tempo médio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {pages.map((row) => (
            <tr key={row.page}>
              <td className="max-w-xs truncate py-2.5 pr-4 font-mono text-xs text-ink-700">{row.page}</td>
              <td className="py-2.5 pr-4 font-medium text-ink-900">{formatNumber(row.views)}</td>
              <td className="py-2.5 pr-4 text-ink-600">{formatNumber(row.visitors)}</td>
              <td className="py-2.5 text-ink-500" title="Não medido nesta etapa">
                —
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TopPagesTable
