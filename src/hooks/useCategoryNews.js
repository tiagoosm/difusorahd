import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategoryBySlug } from '../services/categories'
import { fetchNewsByCategory } from '../services/news'
import { trackPageView } from '../services/analytics'

// Page 1: 1 featured item + 15 grid cards (16 rows fetched). Pages 2+: no
// featured item (that slot is "this category's current top story", which
// only makes sense once, not once per page) — just a 15-card grid, kept
// at 15 rather than reusing page 1's 16 specifically so it still divides
// evenly into the 3-column desktop grid (15 / 3 = 5 full rows) with no
// trailing empty cell, the same reasoning page 1's size already followed.
const FEATURED_COUNT = 1
const GRID_PAGE_SIZE = 15
const FIRST_PAGE_SIZE = FEATURED_COUNT + GRID_PAGE_SIZE

function getRangeForPage(page) {
  if (page <= 1) return { from: 0, to: FIRST_PAGE_SIZE - 1 }
  const from = FIRST_PAGE_SIZE + (page - 2) * GRID_PAGE_SIZE
  return { from, to: from + GRID_PAGE_SIZE - 1 }
}

// Not a plain ceil(total/pageSize): page 1 holds one more row than the
// rest, so it "uses up" the featured slot for every page after it.
export function getCategoryTotalPages(totalCount) {
  if (totalCount <= FIRST_PAGE_SIZE) return 1
  return 1 + Math.ceil((totalCount - FIRST_PAGE_SIZE) / GRID_PAGE_SIZE)
}

async function fetchCategoryData(slug) {
  const { data, error } = await fetchCategoryBySlug(slug)
  if (error) throw error
  return data // null = category doesn't exist (not a request error)
}

async function fetchCategoryNewsData(categoryId, page) {
  const { from, to } = getRangeForPage(page)
  const { data, count, error } = await fetchNewsByCategory({ categoryId, from, to })
  if (error) throw error
  return { news: data ?? [], totalCount: count ?? 0 }
}

export function useCategoryNews(slug, page) {
  const categoryQuery = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryData(slug),
    enabled: !!slug,
  })

  const category = categoryQuery.data ?? null
  // isSuccess (not just "!loading") guarantees we only declare notFound
  // after a real API response — never during the initial/pending state.
  const notFound = categoryQuery.isSuccess && !category

  const newsQuery = useQuery({
    queryKey: ['category', slug, 'news', page],
    queryFn: () => fetchCategoryNewsData(category.id, page),
    enabled: !!category?.id,
  })

  const loading = categoryQuery.isLoading || newsQuery.isLoading
  const error = categoryQuery.error ?? newsQuery.error ?? null

  const trackedSlugRef = useRef(null)
  useEffect(() => {
    if (!category || trackedSlugRef.current === slug) return
    trackedSlugRef.current = slug
    trackPageView({ page: `/categoria/${slug}`, pageType: 'category', categoryId: category.id })
  }, [category, slug])

  function retry() {
    categoryQuery.refetch()
    newsQuery.refetch()
  }

  return {
    category,
    news: newsQuery.data?.news ?? [],
    totalCount: newsQuery.data?.totalCount ?? 0,
    totalPages: getCategoryTotalPages(newsQuery.data?.totalCount ?? 0),
    loading,
    notFound,
    error,
    retry,
  }
}
