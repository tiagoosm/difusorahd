import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NumberedPagination from './NumberedPagination'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

const buildHref = (page) => (page <= 1 ? '/categoria/esportes' : `/categoria/esportes?page=${page}`)

describe('NumberedPagination — rendering', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = renderWithRouter(
      <NumberedPagination page={1} totalPages={1} buildHref={buildHref} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('marks the current page with aria-current="page"', () => {
    renderWithRouter(<NumberedPagination page={3} totalPages={5} buildHref={buildHref} />)

    const current = screen.getAllByRole('link', { name: 'Página 3' })[0]
    expect(current).toHaveAttribute('aria-current', 'page')

    const other = screen.getAllByRole('link', { name: 'Página 1' })[0]
    expect(other).not.toHaveAttribute('aria-current')
  })

  it('disables "Página anterior" on the first page (not a link)', () => {
    renderWithRouter(<NumberedPagination page={1} totalPages={5} buildHref={buildHref} />)

    expect(screen.queryAllByRole('link', { name: 'Página anterior' })).toHaveLength(0)
    const disabled = screen.getAllByLabelText('Página anterior')[0]
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
  })

  it('disables "Próxima página" on the last page (not a link)', () => {
    renderWithRouter(<NumberedPagination page={5} totalPages={5} buildHref={buildHref} />)

    expect(screen.queryAllByRole('link', { name: 'Próxima página' })).toHaveLength(0)
    const disabled = screen.getAllByLabelText('Próxima página')[0]
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
  })

  it('keeps prev/next as real, clickable links in the middle of the range', () => {
    renderWithRouter(<NumberedPagination page={3} totalPages={5} buildHref={buildHref} />)

    expect(screen.getAllByRole('link', { name: 'Página anterior' })[0]).toHaveAttribute(
      'href',
      '/categoria/esportes?page=2',
    )
    expect(screen.getAllByRole('link', { name: 'Próxima página' })[0]).toHaveAttribute(
      'href',
      '/categoria/esportes?page=4',
    )
  })

  it('builds page 1 links without a ?page= query string', () => {
    renderWithRouter(<NumberedPagination page={2} totalPages={5} buildHref={buildHref} />)

    expect(screen.getAllByRole('link', { name: 'Página 1' })[0]).toHaveAttribute('href', '/categoria/esportes')
  })

  it('exposes a navigation landmark labelled "Paginação"', () => {
    renderWithRouter(<NumberedPagination page={1} totalPages={5} buildHref={buildHref} />)
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument()
  })
})
