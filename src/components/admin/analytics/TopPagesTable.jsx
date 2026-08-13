import { formatNumber } from '../../../utils/formatNumber'
import EmptyState from '../../ui/EmptyState'

// "Tempo médio na página" não é coletado hoje (exigiria medir o momento de
// saída de cada visita, fora do escopo desta etapa) — a coluna existe só
// para deixar essa limitação explícita, em vez de inventar um valor.
function TopPagesTable({ pages, loading }) {
  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-100" />
  }

  if (pages.length === 0) {
    return <EmptyState title="Nenhum acesso registrado no período" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-gray-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Página</th>
            <th className="py-2 pr-4 font-medium">Visualizações</th>
            <th className="py-2 pr-4 font-medium">Visitantes</th>
            <th className="py-2 font-medium">Tempo médio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pages.map((row) => (
            <tr key={row.page}>
              <td className="max-w-xs truncate py-2.5 pr-4 font-mono text-xs text-gray-700">{row.page}</td>
              <td className="py-2.5 pr-4 font-medium text-gray-900">{formatNumber(row.views)}</td>
              <td className="py-2.5 pr-4 text-gray-600">{formatNumber(row.visitors)}</td>
              <td className="py-2.5 text-gray-400" title="Não medido nesta etapa">
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
