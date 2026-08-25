import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../services/categories'

async function fetchCategoriesData() {
  const { data, error } = await fetchCategories()
  // Navegação por categoria é conteúdo de apoio, não crítico: falha aqui
  // degrada para lista vazia em vez de travar Navbar/Footer com um erro.
  if (error) return []
  return data ?? []
}

// Navbar, Footer e NewsForm usam este hook na mesma página — o cache do
// React Query (chave 'categories' compartilhada) garante uma única
// requisição de rede por sessão em vez de uma por componente montado.
export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesData,
    staleTime: 5 * 60 * 1000,
  })

  return { categories: data ?? [], loading: isLoading }
}
