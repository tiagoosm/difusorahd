import { useEffect, useState } from 'react'
import { fetchCategories } from '../services/categories'

// Navbar e Footer usam este hook na mesma página, e o StrictMode monta cada
// um duas vezes em dev — eram 4 requisições idênticas por carregamento para
// uma lista que praticamente não muda. O cache em memória (mais a promise
// em voo compartilhada) reduz isso a uma única requisição por sessão.
let cache = null
let inFlight = null

function loadCategories() {
  if (cache) return Promise.resolve(cache)
  if (inFlight) return inFlight

  inFlight = fetchCategories().then(({ data, error }) => {
    inFlight = null
    // Erro não é cacheado: a próxima montagem tenta de novo em vez de ficar
    // presa numa lista vazia até o usuário recarregar a página.
    if (error) return []
    cache = data ?? []
    return cache
  })

  return inFlight
}

export function useCategories() {
  const [categories, setCategories] = useState(() => cache ?? [])
  const [loading, setLoading] = useState(() => !cache)

  useEffect(() => {
    if (cache) return

    let isMounted = true

    loadCategories().then((data) => {
      if (!isMounted) return
      setCategories(data)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return { categories, loading }
}
