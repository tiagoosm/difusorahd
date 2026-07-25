import { useCallback, useEffect, useState } from 'react'
import { fetchCategories } from '../services/categories'

export function useCategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchCategories()
    setCategories(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { categories, loading, reload }
}
