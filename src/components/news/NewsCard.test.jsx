import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NewsCard from './NewsCard'

const VERY_LONG_TITLE =
  'Prefeitura de Pouso Alegre anuncia investimento histórico de mais de 400 milhões de reais em obras de infraestrutura, saúde, educação e mobilidade urbana para os próximos quatro anos'

const NEWS = {
  id: '1',
  slug: 'a',
  title: VERY_LONG_TITLE,
  excerpt: 'Resumo',
  cover_image_url: 'https://example.com/a.png',
  published_at: '2026-08-10T12:00:00Z',
  category: { name: 'Cotidiano' },
}

describe('NewsCard — título nunca é cortado (usado em Categoria, Busca e Relacionadas)', () => {
  it('renders the full title text regardless of length', () => {
    render(
      <MemoryRouter>
        <NewsCard news={NEWS} />
      </MemoryRouter>,
    )

    expect(screen.getByText(VERY_LONG_TITLE)).toBeInTheDocument()
  })

  it('never applies line-clamp/truncate to the title', () => {
    render(
      <MemoryRouter>
        <NewsCard news={NEWS} />
      </MemoryRouter>,
    )

    const heading = screen.getByText(VERY_LONG_TITLE)
    expect(heading.className).not.toMatch(/line-clamp/)
    expect(heading.className).not.toMatch(/truncate/)
  })
})

describe('NewsCard — compact (used by "Notícias relacionadas")', () => {
  it('uses a shorter image aspect ratio than the regular card', () => {
    const { container } = render(
      <MemoryRouter>
        <NewsCard news={NEWS} compact />
      </MemoryRouter>,
    )

    const imageWrapper = container.querySelector('img').parentElement
    expect(imageWrapper.className).toMatch(/sm:aspect-\[2\/1\]/)
    expect(imageWrapper.className).not.toMatch(/sm:aspect-video/)
  })

  it('defaults to the regular (non-compact) 16:9 image', () => {
    const { container } = render(
      <MemoryRouter>
        <NewsCard news={NEWS} />
      </MemoryRouter>,
    )

    const imageWrapper = container.querySelector('img').parentElement
    expect(imageWrapper.className).toMatch(/sm:aspect-video/)
  })

  it('clamps the excerpt to 2 lines either way — only the image/padding change', () => {
    render(
      <MemoryRouter>
        <NewsCard news={NEWS} compact />
      </MemoryRouter>,
    )

    expect(screen.getByText('Resumo').className).toMatch(/sm:line-clamp-2/)
  })
})
