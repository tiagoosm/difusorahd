import { Megaphone } from 'lucide-react'
import AdCard from './AdCard'
import EmptyState from '../ui/EmptyState'

function AdList({ ads, onDelete }) {
  if (ads.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Nenhum anúncio encontrado"
        description="Ajuste os filtros ou cadastre um novo anúncio."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default AdList
