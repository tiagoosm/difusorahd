export function getAdStatus(ad) {
  if (!ad.active) return { label: 'Inativo', tone: 'gray' }

  const now = new Date()
  const start = new Date(ad.start_date)
  const end = new Date(ad.end_date)

  if (now < start) return { label: 'Agendado', tone: 'amber' }
  if (now > end) return { label: 'Expirado', tone: 'red' }
  return { label: 'Ativo', tone: 'green' }
}
