import Badge from '../ui/Badge'
import { getAdStatus } from '../../utils/adStatus'

function AdStatusBadge({ ad }) {
  const { label, tone } = getAdStatus(ad)
  return <Badge tone={tone}>{label}</Badge>
}

export default AdStatusBadge
