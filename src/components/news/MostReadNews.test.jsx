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

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Matéria A')).toBeInTheDocument()
    expect(screen.getByText('Matéria B')).toBeInTheDocument()
  })

  it('does not render the removed flame icon (or any decorative icon in the header, to match the rest of the site)', () => {
    const { container } = renderWithRouter(<MostReadNews items={ITEMS} />)

    expect(container.querySelector('svg.lucide-flame')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('highlights the section title with a brand-colored background instead of a "Ranking" label', () => {
    renderWithRouter(<MostReadNews items={ITEMS} />)

    const heading = screen.getByRole('heading', { name: 'Mais Lidas da Semana' })
    expect(heading.className).toMatch(/bg-brand-600/)
    expect(screen.queryByText('Ranking')).toBeNull()
    expect(screen.getByText('Cotidiano')).toBeInTheDocument()
  })

  it('gives the ranking badge a color hierarchy that fades by position instead of a flat gray number', () => {
    renderWithRouter(<MostReadNews items={ITEMS} />)

    expect(screen.getByText('1').className).toMatch(/(?<!:)bg-brand-600/)
    expect(screen.getByText('2').className).not.toMatch(/(?<!:)bg-brand-600/)
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
