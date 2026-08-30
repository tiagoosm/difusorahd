import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LatestNewsList from './LatestNewsList'

const SHORT_TITLE = 'CAC divulga vagas'
const MEDIUM_TITLE = 'Fernão Dias registra 2º atropelamento de cavalos em pouco mais de mês'
const VERY_LONG_TITLE =
  'Prefeitura de Pouso Alegre anuncia investimento histórico de mais de 400 milhões de reais em obras de infraestrutura, saúde, educação e mobilidade urbana para os próximos quatro anos, segundo anúncio feito nesta quinta-feira pela administração municipal em coletiva de imprensa'

const ITEMS = [
  { id: '1', slug: 'a', title: SHORT_TITLE, cover_image_url: 'https://example.com/a.png', published_at: '2026-08-10', category: { name: 'Cotidiano' } },
  { id: '2', slug: 'b', title: MEDIUM_TITLE, cover_image_url: 'https://example.com/b.png', published_at: '2026-08-10', category: { name: 'Cotidiano' } },
  { id: '3', slug: 'c', title: VERY_LONG_TITLE, cover_image_url: 'https://example.com/c.png', published_at: '2026-08-10', category: { name: 'Economia' } },
]

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('LatestNewsList', () => {
  it('renders nothing when there are no items', () => {
    const { container } = renderWithRouter(<LatestNewsList title="Últimas notícias" items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the heading and one card per item', () => {
    renderWithRouter(<LatestNewsList title="Últimas notícias" items={ITEMS} />)

    expect(screen.getByRole('heading', { name: 'Últimas notícias' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(ITEMS.length)
  })

  // Regra da seção: 9 notícias juntas em sequência (mobile: lista contínua;
  // lg+: grade 3x3) — nunca uma grade quebrada com itens escondidos.
  it('lays out items as a single grid (lg:grid-cols-3), with none hidden at any breakpoint', () => {
    const { container } = renderWithRouter(<LatestNewsList title="Últimas notícias" items={ITEMS} />)

    const grid = container.querySelector('.lg\\:grid-cols-3')
    expect(grid).not.toBeNull()
    expect(grid.querySelectorAll('a')).toHaveLength(ITEMS.length)

    for (const link of grid.querySelectorAll('a')) {
      expect(link.className).not.toMatch(/hidden/)
    }
  })

  describe('títulos sempre completos', () => {
    it('renders the full title text for short, medium and very long headlines', () => {
      renderWithRouter(<LatestNewsList title="Últimas notícias" items={ITEMS} />)

      expect(screen.getByText(SHORT_TITLE)).toBeInTheDocument()
      expect(screen.getByText(MEDIUM_TITLE)).toBeInTheDocument()
      expect(screen.getByText(VERY_LONG_TITLE)).toBeInTheDocument()
    })

    it('never applies line-clamp, truncate or overflow-hidden to the title element', () => {
      renderWithRouter(<LatestNewsList title="Últimas notícias" items={ITEMS} />)

      for (const title of [SHORT_TITLE, MEDIUM_TITLE, VERY_LONG_TITLE]) {
        const heading = screen.getByText(title)
        expect(heading.className).not.toMatch(/line-clamp/)
        expect(heading.className).not.toMatch(/truncate/)
        expect(heading.className).not.toMatch(/overflow-hidden/)
        expect(heading.style.maxHeight).toBe('')
      }
    })
  })
})
