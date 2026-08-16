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

  it('does not render the removed flame icon, and uses the trending-up icon instead', () => {
    const { container } = renderWithRouter(<MostReadNews items={ITEMS} />)

    expect(container.querySelector('svg.lucide-flame')).toBeNull()
    expect(container.querySelector('svg.lucide-trending-up')).not.toBeNull()
  })
})
