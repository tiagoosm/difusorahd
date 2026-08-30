import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedNews, fetchLatestNews, fetchWeeklyTopNews } from '../services/news'
import { useCategories } from './useCategories'
import { trackPageView } from '../services/analytics'

const LATEST_DISPLAY_COUNT = 9
const MOST_READ_DISPLAY_COUNT = 10
const CATEGORY_SECTION_COUNT = 3

// Pool shared by ALL category sections: a single request (the N most
// recent articles site-wide), grouped by category on the client — instead
// of one request per existing category (see request item 9: "don't make
// an individual request for each category"). The pool size scales with
// the number of categories (more categories = bigger pool, to keep ~3
// recent articles per category), with a floor and a ceiling so it never
// becomes 1 request nor excessively heavy.
const CATEGORY_POOL_PER_CATEGORY = 15
const CATEGORY_POOL_MIN = 60
const CATEGORY_POOL_MAX = 300

async function fetchFeaturedData() {
  const { data, error } = await fetchFeaturedNews(6)
  if (error) throw error
  return data ?? []
}

async function fetchLatestData() {
  const { data, error } = await fetchLatestNews(LATEST_DISPLAY_COUNT)
  if (error) throw error
  return data ?? []
}

async function fetchMostReadData() {
  // Fetches enough slack to still have MOST_READ_DISPLAY_COUNT left even
  // in the worst case (everyone at the top is already in Featured/Latest).
  const { data, error } = await fetchWeeklyTopNews(MOST_READ_DISPLAY_COUNT + 20)
  if (error) throw error
  return data ?? []
}

function makeFetchCategoryPool(poolSize) {
  return async () => {
    const { data, error } = await fetchLatestNews(poolSize)
    if (error) throw error
    return data ?? []
  }
}

export function useHomeNews() {
  // Categories are 100% dynamic (`categories` table) — never hardcoded
  // here. If a category is created/removed, the list changes and the
  // sections below follow automatically, without touching this hook.
  const { categories } = useCategories()
  const poolSize = Math.min(
    CATEGORY_POOL_MAX,
    Math.max(CATEGORY_POOL_MIN, categories.length * CATEGORY_POOL_PER_CATEGORY),
  )

  const featuredQuery = useQuery({ queryKey: ['home', 'featured'], queryFn: fetchFeaturedData })
  const latestQuery = useQuery({ queryKey: ['home', 'latest'], queryFn: fetchLatestData })
  // Most Read is complementary: its own failure doesn't block the Home
  // page (see `error` below, which only looks at featured/latest).
  const mostReadQuery = useQuery({ queryKey: ['home', 'mostRead'], queryFn: fetchMostReadData })
  const categoryPoolQuery = useQuery({
    queryKey: ['home', 'categoryPool', poolSize],
    queryFn: makeFetchCategoryPool(poolSize),
    enabled: categories.length > 0,
  })

  const loading = featuredQuery.isLoading || latestQuery.isLoading || mostReadQuery.isLoading
  const error = featuredQuery.error ?? latestQuery.error ?? null

  const featuredItems = featuredQuery.data ?? []
  const latestItems = latestQuery.data ?? []

  // Most Read never repeats an article already shown in Featured/Latest.
  // This is deliberate (avoids showing the same article twice above the
  // fold) — category sections CAN repeat articles from Latest/Most Read
  // though, because they're different contexts (see original request, item 3.4).
  const alreadyShown = new Set([...featuredItems, ...latestItems].map((item) => item.id))
  const mostReadItems = (mostReadQuery.data ?? [])
    .filter((item) => !alreadyShown.has(item.id))
    .slice(0, MOST_READ_DISPLAY_COUNT)

  // One section per existing category, in the same order as
  // useCategories() (alphabetical), with that category's 3 most recent
  // articles. A category with no published articles doesn't produce a
  // section (no empty block).
  const categoryPool = categoryPoolQuery.data ?? []
  const categorySections = categories
    .map((category) => ({
      category,
      items: categoryPool.filter((item) => item.category?.id === category.id).slice(0, CATEGORY_SECTION_COUNT),
    }))
    .filter((section) => section.items.length > 0)

  // Fires once per successful load — not on every re-render, and not
  // again if the user just refocused the tab.
  const trackedRef = useRef(false)
  useEffect(() => {
    if (loading || error || trackedRef.current) return
    trackedRef.current = true
    trackPageView({ page: '/', pageType: 'home' })
  }, [loading, error])

  function retry() {
    featuredQuery.refetch()
    latestQuery.refetch()
    mostReadQuery.refetch()
    categoryPoolQuery.refetch()
  }

  return {
    featured: featuredItems,
    latest: latestItems,
    categorySections,
    mostRead: mostReadItems,
    loading,
    error,
    retry,
  }
}
