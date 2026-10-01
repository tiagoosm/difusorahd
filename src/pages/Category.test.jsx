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

describe('Category — page 1 (1 featured + 15 grid = 16)', () => {
  it('renders exactly 1 featured item + 15 grid cards, with no pagination for a single page', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(16), count: 16, error: null })

    renderCategory()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Esportes', level: 1 })).toBeInTheDocument()
    })
    expect(fetchNewsByCategory).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-1', from: 0, to: 15 }),
    )

    for (let n = 1; n <= 16; n++) {
      expect(screen.getByText(`Notícia ${n}`)).toBeInTheDocument()
    }
    // The featured item renders as the large NewsRow heading.
    const featured = screen.getByText('Notícia 1')
    expect(featured.className).toMatch(/text-2xl|text-lg/)
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
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

describe('Category — pages after the first (no featured item, 15-card grid)', () => {
  it('page 2 has no featured item — every article is a plain grid card', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(15, 17), count: 31, error: null })

    renderCategory('/categoria/esportes?page=2')

    await waitFor(() => {
      expect(screen.getByText('Notícia 17')).toBeInTheDocument()
    })
    expect(fetchNewsByCategory).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-1', from: 16, to: 30 }),
    )

    // Notícia 17 is the first item of page 2's fetch, but — unlike page
    // 1 — it must NOT get the large featured treatment.
    const heading = screen.getByText('Notícia 17')
    expect(heading.className).not.toMatch(/text-2xl|text-lg/)
    expect(screen.getAllByRole('link', { name: /Notícia \d/ })).toHaveLength(15)
  })

  it('a single remaining article on a later page renders as a plain grid card, not a featured item', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(1, 32), count: 32, error: null })

    renderCategory('/categoria/esportes?page=3')

    await waitFor(() => {
      expect(screen.getByText('Notícia 32')).toBeInTheDocument()
    })
    expect(screen.getByText('Notícia 32').className).not.toMatch(/text-2xl|text-lg/)
  })
})

describe('Category — pagination math (page 1 has 16 rows, every later page has 15)', () => {
  it.each([
    [16, 1],
    [17, 2],
    [31, 2],
    [32, 3],
    [46, 3],
    [50, 4],
  ])('%i total articles -> %i pages', async (totalCount, expectedPages) => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(Math.min(totalCount, 16)), count: totalCount, error: null })

    renderCategory()

    await waitFor(() => {
      expect(screen.getByText('Notícia 1')).toBeInTheDocument()
    })

    if (expectedPages <= 1) {
      expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
    } else {
      const nav = screen.getByRole('navigation', { name: 'Paginação' })
      expect(nav.querySelectorAll(`a[aria-label="Página ${expectedPages}"]`).length).toBeGreaterThan(0)
    }
  })

  it('requests the page from the URL (?page=2) via fetchNewsByCategory', async () => {
    fetchNewsByCategory.mockResolvedValue({ data: makeNews(15, 17), count: 50, error: null })

    renderCategory('/categoria/esportes?page=2')

    await waitFor(() => {
      expect(fetchNewsByCategory).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1', from: 16, to: 30 }),
      )
    })
  })
})
