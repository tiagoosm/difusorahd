import { useEffect, useState } from 'react'
import { fetchCategories } from '../services/categories'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchCategories().then(({ data, error }) => {
      if (!isMounted) return
      if (!error) setCategories(data ?? [])
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return { categories, loading }
}
