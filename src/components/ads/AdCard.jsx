import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { AD_POSITION_LABELS } from '../../utils/adPositions'
import AdStatusBadge from './AdStatusBadge'

function AdCard({ ad, onDelete }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-16 sm:w-32">
        <img src={ad.image_url} alt={ad.title} className="h-full w-full object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold text-gray-900">{ad.title}</span>
        <span className="text-xs text-gray-500">
          {AD_POSITION_LABELS[ad.position]?.label ?? ad.position}
        </span>
        <span className="text-xs text-gray-400">
          {formatDate(ad.start_date)} — {formatDate(ad.end_date)}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
        <span className="text-xs text-gray-500">Prioridade {ad.priority}</span>
        <AdStatusBadge ad={ad} />
      </div>

      <div className="flex justify-end gap-1">
        <Link
          to={buildPath.adminAdsEdit(ad.id)}
          aria-label="Editar"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(ad)}
          aria-label="Excluir"
          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default AdCard
