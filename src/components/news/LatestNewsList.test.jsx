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

describe('LatestNewsList — títulos sempre completos', () => {
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

describe('LatestNewsList — lista contínua de 9 no mobile', () => {
  it('renders mobileExtraItems marked lg:hidden, so only the desktop grid (lg+) ever hides them', () => {
    const extra = [
      { id: '4', slug: 'd', title: 'Extra 1', cover_image_url: 'https://example.com/d.png', published_at: '2026-08-10' },
      { id: '5', slug: 'e', title: 'Extra 2', cover_image_url: 'https://example.com/e.png', published_at: '2026-08-10' },
      { id: '6', slug: 'f', title: 'Extra 3', cover_image_url: 'https://example.com/f.png', published_at: '2026-08-10' },
    ]
    renderWithRouter(<LatestNewsList title="Últimas notícias" items={ITEMS} mobileExtraItems={extra} />)

    for (const title of ['Extra 1', 'Extra 2', 'Extra 3']) {
      const link = screen.getByText(title).closest('a')
      expect(link.className).toMatch(/lg:hidden/)
    }
  })

  it('does not mark the first 6 (desktop grid) items lg:hidden', () => {
    renderWithRouter(<LatestNewsList title="Últimas notícias" items={ITEMS} mobileExtraItems={[]} />)

    for (const title of [SHORT_TITLE, MEDIUM_TITLE, VERY_LONG_TITLE]) {
      const link = screen.getByText(title).closest('a')
      expect(link.className).not.toMatch(/lg:hidden/)
    }
  })
})
