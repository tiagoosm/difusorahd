import { useCallback, useEffect, useState } from 'react'
import { fetchSweepstakesParticipantsCount } from '../services/sweepstakes'

// Contagem do resumo no topo da seção Sorteio ("Participantes cadastrados:
// 000") — separada da query paginada da tabela, pra continuar mostrando o
// total real mesmo com filtros de busca/status aplicados na lista abaixo.
export function useSweepstakesCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { count: total } = await fetchSweepstakesParticipantsCount()
    setCount(total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { count, loading, reload }
}
