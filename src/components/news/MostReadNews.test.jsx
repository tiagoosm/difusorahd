import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MostReadNews from './MostReadNews'

function makeItems(count) {
  return Array.from({ length: count }).map((_, index) => ({
    id: String(index + 1),
    slug: `noticia-${index + 1}`,
    title: `Matéria ${index + 1}`,
    cover_image_url: `https://example.com/${index + 1}.png`,
    category: { name: index === 0 ? 'Cotidiano' : 'Economia' },
  }))
}

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MostReadNews', () => {
  it('renders nothing when there are no items', () => {
    const { container } = renderWithRouter(<MostReadNews items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a numbered editorial list with one entry per item, without a view count', () => {
    renderWithRouter(<MostReadNews items={makeItems(10)} />)

    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Matéria 1')).toBeInTheDocument()
    expect(screen.getByText('Matéria 10')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(10)
  })

  it('does not render a flame icon or any decorative icon (matches the rest of the site)', () => {
    const { container } = renderWithRouter(<MostReadNews items={makeItems(10)} />)

    expect(container.querySelector('svg.lucide-flame')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('uses a plain heading (no colored banner, no "Ranking" label) so the section stays discreet', () => {
    renderWithRouter(<MostReadNews items={makeItems(2)} />)

    const heading = screen.getByRole('heading', { name: 'Mais Lidas' })
    expect(heading.className).not.toMatch(/bg-brand-600/)
    expect(screen.queryByText('Ranking')).toBeNull()
    expect(screen.getByText('Cotidiano')).toBeInTheDocument()
  })

  it('keeps the ranking numeral small, neutral and undecorated so it never outweighs the title', () => {
    renderWithRouter(<MostReadNews items={makeItems(2)} />)

    const numeral = screen.getByText('01')
    expect(numeral.className).toMatch(/text-xs/)
    expect(numeral.className).toMatch(/text-ink-300/)
    expect(numeral.className).not.toMatch(/font-black|font-extrabold|font-bold|bg-brand-600|rounded-full|ring-/)

    const title = screen.getByText('Matéria 1')
    expect(title.className).toMatch(/font-semibold/)
  })

  it('hides the ranking thumbnail on mobile (image reappears from sm+), keeping the title as the focus', () => {
    const { container } = renderWithRouter(<MostReadNews items={makeItems(2)} />)

    const thumbWrapper = container.querySelector('img[alt=""]').parentElement
    expect(thumbWrapper.className).toMatch(/(?:^|\s)hidden(?:\s|$)/)
    expect(thumbWrapper.className).toMatch(/sm:block/)
  })

  // New structure: 2 columns of 5 on desktop (01-05 on the left, 06-10 on
  // the right), 1 continuous column on mobile — never again a ranking of 5
  // with a filler card.
  it('lays out 10 items as 2 columns of 5 (grid-flow-col + grid-rows-5) on sm+', () => {
    const { container } = renderWithRouter(<MostReadNews items={makeItems(10)} />)

    const list = container.querySelector('ol')
    expect(list.className).toMatch(/sm:grid-cols-2/)
    expect(list.className).toMatch(/sm:grid-flow-col/)
    expect(list.className).toMatch(/sm:grid-rows-5/)
    expect(list.children).toHaveLength(10)
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
