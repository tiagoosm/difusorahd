import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../services/categories'

async function fetchCategoriesData() {
  const { data, error } = await fetchCategories()
  // Category navigation is supporting content, not critical: a failure
  // here degrades to an empty list instead of breaking Navbar/Footer with
  // an error.
  if (error) return []
  return data ?? []
}

// Navbar, Footer and NewsForm use this hook on the same page — React
// Query's cache (shared 'categories' key) guarantees a single network
// request per session instead of one per mounted component.
export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesData,
    staleTime: 5 * 60 * 1000,
  })

  return { categories: data ?? [], loading: isLoading }
}
