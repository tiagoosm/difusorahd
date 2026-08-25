import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MostReadNews from './MostReadNews'

const ITEMS = [
  { id: '1', slug: 'a', title: 'Matéria A', cover_image_url: 'https://example.com/a.png', category: { name: 'Cotidiano' } },
  { id: '2', slug: 'b', title: 'Matéria B', cover_image_url: 'https://example.com/b.png', category: { name: 'Economia' } },
]

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MostReadNews', () => {
  it('renders nothing when there are no items', () => {
    const { container } = renderWithRouter(<MostReadNews items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a numbered ranking with one entry per item, without a view count', () => {
    renderWithRouter(<MostReadNews items={ITEMS} />)

    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('Matéria A')).toBeInTheDocument()
    expect(screen.getByText('Matéria B')).toBeInTheDocument()
  })

  it('does not render the removed flame icon (or any decorative icon in the header, to match the rest of the site)', () => {
    const { container } = renderWithRouter(<MostReadNews items={ITEMS} />)

    expect(container.querySelector('svg.lucide-flame')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('uses a plain heading (no colored banner, no "Ranking" label) so the section stays discreet', () => {
    renderWithRouter(<MostReadNews items={ITEMS} />)

    const heading = screen.getByRole('heading', { name: 'Mais Lidas' })
    expect(heading.className).not.toMatch(/bg-brand-600/)
    expect(screen.queryByText('Ranking')).toBeNull()
    expect(screen.getByText('Cotidiano')).toBeInTheDocument()
  })

  it('keeps the ranking numeral small, neutral and undecorated so it never outweighs the title', () => {
    renderWithRouter(<MostReadNews items={ITEMS} />)

    const numeral = screen.getByText('01')
    expect(numeral.className).toMatch(/text-xs/)
    expect(numeral.className).toMatch(/text-ink-300/)
    expect(numeral.className).not.toMatch(/font-black|font-extrabold|font-bold|bg-brand-600|rounded-full|ring-/)

    const title = screen.getByText('Matéria A')
    expect(title.className).toMatch(/font-semibold/)
  })

  it('hides the ranking thumbnail on mobile (image reappears from sm+), keeping the title as the focus', () => {
    const { container } = renderWithRouter(<MostReadNews items={ITEMS} />)

    const thumbWrapper = container.querySelector('img[alt=""]').parentElement
    expect(thumbWrapper.className).toMatch(/(?:^|\s)hidden(?:\s|$)/)
    expect(thumbWrapper.className).toMatch(/sm:block/)
  })

  it('fills leftover sidebar space with a full news card (same style as Últimas notícias) when moreItems is given', () => {
    const moreItems = [
      {
        id: '3',
        slug: 'c',
        title: 'Matéria C',
        cover_image_url: 'https://example.com/c.png',
        category: { name: 'Rádio' },
        published_at: '2026-01-01T00:00:00Z',
      },
    ]
    const { container } = renderWithRouter(<MostReadNews items={ITEMS} moreItems={moreItems} />)

    expect(screen.getByText('Matéria C')).toBeInTheDocument()
    // Cartão de preenchimento não tem número de ranking (não faz parte do
    // top 5) nem a largura fixa (h-14 w-14) da miniatura do ranking — é o
    // mesmo cartão grande (aspect-video em lg+) usado em "Últimas notícias",
    // e só aparece a partir do desktop (lg:flex) — no mobile não há espaço
    // sobrando pra preencher.
    expect(screen.queryByText('03')).toBeNull()
    expect(container.querySelector('.lg\\:aspect-video')).not.toBeNull()
    expect(container.querySelector('.hidden.lg\\:flex')).not.toBeNull()
  })

  it('does not render any filler card when there are no extra items', () => {
    renderWithRouter(<MostReadNews items={ITEMS} />)
    expect(screen.getAllByRole('link')).toHaveLength(ITEMS.length)
  })

  it('never truncates a ranking title', () => {
    const longTitle =
      'Prefeitura de Pouso Alegre anuncia investimento histórico de mais de 400 milhões de reais em obras'
    renderWithRouter(
      <MostReadNews items={[{ id: '1', slug: 'a', title: longTitle, cover_image_url: 'https://example.com/a.png' }]} />,
    )

    const heading = screen.getByText(longTitle)
    expect(heading.className).not.toMatch(/line-clamp/)
  })
})
