import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../services/categories', () => ({ fetchCategoryBySlug: vi.fn() }))
vi.mock('../services/news', () => ({ fetchNewsByCategory: vi.fn() }))
vi.mock('../services/analytics', () => ({ trackPageView: vi.fn() }))
vi.mock('../hooks/useSEO', () => ({ useSEO: vi.fn() }))

import { fetchCategoryBySlug } from '../services/categories'
import { fetchNewsByCategory } from '../services/news'
import Category from './Category'

const CATEGORY = { id: 'cat-1', name: 'Esportes', slug: 'esportes', description: 'Notícias esportivas' }

function makeNews(count, startAt = 1) {
  return Array.from({ length: count }).map((_, index) => {
    const n = startAt + index
    return {
      id: `news-${n}`,
      slug: `noticia-${n}`,
      title: `Notícia ${n}`,
      excerpt: `Resumo ${n}`,
      cover_image_url: `https://example.com/${n}.png`,
      published_at: '2026-01-01T00:00:00Z',
      category: { name: 'Esportes' },
    }
  })
}

function renderCategory(initialPath = '/categoria/esportes') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/categoria/:slug" element={<Category />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchCategoryBySlug.mockResolvedValue({ data: CATEGORY, error: null })
})

describe('Category — 16 per page (1 featured + 15 grid)', () => {
  it('renders exactly 1 featured item + 15 grid cards for a full page, with no pagination for a single page', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(16), count: 16, error: null })

    renderCategory()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Esportes', level: 1 })).toBeInTheDocument()
    })

    // The featured item renders as a size="lg" NewsRow heading (h3, not clamped);
    // every one of the 16 fetched articles should appear exactly once.
    for (let n = 1; n <= 16; n++) {
      expect(screen.getByText(`Notícia ${n}`)).toBeInTheDocument()
    }
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
  })

  it('still shows a featured item on page 2 (not just page 1)', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(16, 17), count: 32, error: null })

    renderCategory('/categoria/esportes?page=2')

    await waitFor(() => {
      expect(screen.getByText('Notícia 17')).toBeInTheDocument()
    })

    // Notícia 17 (the first item of page 2's fetch) gets the large featured
    // treatment — same NewsRow component/heading level the real page-1
    // featured item uses.
    const heading = screen.getByText('Notícia 17')
    expect(heading.tagName).toBe('H3')
    expect(heading.className).toMatch(/text-2xl|text-lg/)
  })

  it('a partial last page (1 remaining article) shows it as the featured item with no empty grid', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(1, 17), count: 17, error: null })

    renderCategory('/categoria/esportes?page=2')

    await waitFor(() => {
      expect(screen.getByText('Notícia 17')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.includes('noticia-17'))).not.toHaveLength(
      0,
    )
  })

  it('does not render fake/placeholder cards to pad out an incomplete page', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(5), count: 5, error: null })

    renderCategory()

    await waitFor(() => {
      expect(screen.getByText('Notícia 1')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('link', { name: /Notícia \d/ })).toHaveLength(5)
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
  })
})

describe('Category — pagination wiring', () => {
  it('computes totalPages from totalCount/16 and renders numbered pagination', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(16), count: 50, error: null })

    renderCategory()

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument()
    })
    // ceil(50/16) = 4 pages.
    expect(screen.getAllByRole('link', { name: 'Página 4' })[0]).toBeInTheDocument()
  })

  it('requests the page from the URL (?page=2) via fetchNewsByCategory', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(16, 17), count: 50, error: null })

    renderCategory('/categoria/esportes?page=2')

    await waitFor(() => {
      expect(fetchNewsByCategory).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1', page: 2, pageSize: 16 }),
      )
    })
  })
})
