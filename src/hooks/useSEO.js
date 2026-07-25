import { useEffect } from 'react'
import { setSEO } from '../utils/seo'

export function useSEO({ title, description, image, url, noindex = false }) {
  useEffect(() => {
    setSEO({ title, description, image, url, noindex })
  }, [title, description, image, url, noindex])
}
