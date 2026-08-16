import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CategorySection from './CategorySection'

const ITEMS = [
  {
    id: '1',
    slug: 'noticia-um',
    title: 'Notícia um',
    excerpt: 'Resumo um',
    cover_image_url: 'https://example.com/1.png',
    published_at: '2026-08-10T12:00:00Z',
    category: { name: 'Cotidiano' },
  },
  {
    id: '2',
    slug: 'noticia-dois',
    title: 'Notícia dois',
    excerpt: 'Resumo dois',
    cover_image_url: 'https://example.com/2.png',
    published_at: '2026-08-11T12:00:00Z',
    category: { name: 'Economia' },
  },
]

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('CategorySection', () => {
  it('renders nothing when there are no items (no empty section/heading on the page)', () => {
    const { container } = renderWithRouter(<CategorySection title="Últimas notícias" items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the title and one card per item', () => {
    renderWithRouter(<CategorySection title="Últimas notícias" items={ITEMS} />)

    expect(screen.getByRole('heading', { name: 'Últimas notícias' })).toBeInTheDocument()
    expect(screen.getByText('Notícia um')).toBeInTheDocument()
    expect(screen.getByText('Notícia dois')).toBeInTheDocument()
  })

  it('defaults to the 3-column grid, and switches to 2-column when columns=2 (Home "Últimas notícias")', () => {
    const { container: defaultContainer } = renderWithRouter(
      <CategorySection title="Relacionadas" items={ITEMS} />,
    )
    expect(defaultContainer.querySelector('.grid')).toHaveClass('lg:grid-cols-3')

    const { container: twoColContainer } = renderWithRouter(
      <CategorySection title="Últimas notícias" items={ITEMS} columns={2} />,
    )
    expect(twoColContainer.querySelector('.grid')).not.toHaveClass('lg:grid-cols-3')
    expect(twoColContainer.querySelector('.grid')).toHaveClass('sm:grid-cols-2')
  })
})
