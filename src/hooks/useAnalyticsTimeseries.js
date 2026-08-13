import { useEffect, useState } from 'react'
import { fetchAnalyticsTimeseries } from '../services/analytics'

// Agrupar por hora só faz sentido pra períodos curtos (Hoje/Ontem) — pra
// qualquer coisa maior, o gráfico ficaria ilegível com centenas de pontos.
function pickBucket(start, end) {
  const spanHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return spanHours <= 48 ? 'hour' : 'day'
}

export function useAnalyticsTimeseries(range) {
  const [data, setData] = useState([])
  const [bucket, setBucket] = useState('day')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const nextBucket = pickBucket(range.start, range.end)

    fetchAnalyticsTimeseries(range.start, range.end, nextBucket).then((rows) => {
      if (!isMounted) return
      setBucket(nextBucket)
      setData(rows)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [range.start, range.end])

  return { data, bucket, loading }
}
