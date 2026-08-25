import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../services/news', () => ({ searchNews: vi.fn() }))
vi.mock('../services/analytics', () => ({ trackPageView: vi.fn() }))
vi.mock('../hooks/useSEO', () => ({ useSEO: vi.fn() }))

import { searchNews } from '../services/news'
import Search from './Search'

function renderSearch(query = 'minas') {
  // retry:false — sem isso, um mock de erro faz o React Query tentar de
  // novo (com backoff) antes de assentar no estado de erro, e os testes
  // de erro estourariam o timeout do waitFor.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/busca?q=${query}`]}>
        <Search />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Search — estados de erro vs. vazio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Regressão do bug principal: o Supabase resolve (não rejeita) com
  // { data: null, error } em falha de rede. Como o erro era descartado, a
  // busca caía no estado vazio e dizia que o termo não existia no site.
  it('shows a load-failure message — not "no results" — when the request errors', async () => {
    searchNews.mockResolvedValue({ data: null, count: null, error: { message: 'FetchError' } })

    renderSearch()

    await waitFor(() => {
      expect(screen.getByText('Não foi possível realizar a busca')).toBeInTheDocument()
    })

    expect(screen.queryByText(/Não encontramos nenhuma matéria/)).toBeNull()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('does not show a result count when the request failed', async () => {
    searchNews.mockResolvedValue({ data: null, count: null, error: { message: 'FetchError' } })

    renderSearch()

    await waitFor(() => {
      expect(screen.getByText('Não foi possível realizar a busca')).toBeInTheDocument()
    })

    expect(screen.queryByText(/resultados? encontrados?/)).toBeNull()
  })

  it('still shows the genuine empty state when the request succeeds with zero results', async () => {
    searchNews.mockResolvedValue({ data: [], count: 0, error: null })

    renderSearch()

    await waitFor(() => {
      expect(screen.getByText('Não encontramos nenhuma matéria para sua busca')).toBeInTheDocument()
    })

    expect(screen.queryByText('Não foi possível realizar a busca')).toBeNull()
  })

  it('retries the request when "Tentar novamente" is clicked, and shows results on success', async () => {
    searchNews.mockResolvedValueOnce({ data: null, count: null, error: { message: 'FetchError' } })

    renderSearch()

    const retryButton = await screen.findByRole('button', { name: 'Tentar novamente' })
    expect(searchNews).toHaveBeenCalledTimes(1)

    searchNews.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          slug: 'a',
          title: 'Matéria depois do retry',
          cover_image_url: 'https://example.com/a.png',
          published_at: '2026-01-01T00:00:00Z',
          category: { name: 'Cotidiano' },
        },
      ],
      count: 1,
      error: null,
    })

    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Matéria depois do retry')).toBeInTheDocument()
    })

    expect(searchNews).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Não foi possível realizar a busca')).toBeNull()
  })

  it('renders results when the request succeeds', async () => {
    searchNews.mockResolvedValue({
      data: [
        {
          id: '1',
          slug: 'a',
          title: 'Matéria encontrada',
          cover_image_url: 'https://example.com/a.png',
          published_at: '2026-01-01T00:00:00Z',
          category: { name: 'Cotidiano' },
        },
      ],
      count: 1,
      error: null,
    })

    renderSearch()

    await waitFor(() => {
      expect(screen.getByText('Matéria encontrada')).toBeInTheDocument()
    })

    expect(screen.queryByText('Não foi possível realizar a busca')).toBeNull()
  })
})
