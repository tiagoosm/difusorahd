import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CoverFocalPointEditor from './CoverFocalPointEditor'

const IMAGE_URL = 'https://example.com/cover.jpg'

function mockBoundingBox(element, { left = 0, top = 0, width = 200, height = 100 } = {}) {
  element.getBoundingClientRect = () => ({ left, top, width, height, right: left + width, bottom: top + height })
}

describe('CoverFocalPointEditor — no image yet', () => {
  it('renders nothing when there is no cover image to position', () => {
    const { container } = render(<CoverFocalPointEditor imageUrl={null} value={null} onChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('CoverFocalPointEditor — "mesmo enquadramento" default', () => {
  it('starts in "same for all" mode when there is no saved data (nothing to diverge from)', () => {
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={null} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: /mesmo enquadramento/i })).toBeChecked()
    // Only one box, no per-context tabs, while "same for all" is on.
    expect(screen.queryByRole('button', { name: 'Destaque' })).not.toBeInTheDocument()
  })

  it('starts in "independent" mode when the saved contexts already differ', () => {
    const value = { featured: { x: 10, y: 10 }, card: { x: 90, y: 90 }, most_read: { x: 50, y: 50 } }
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={value} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: /mesmo enquadramento/i })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Destaque' })).toBeInTheDocument()
  })

  it('dragging in "same for all" mode writes the same point to every context', () => {
    const onChange = vi.fn()
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={null} onChange={onChange} />)

    const box = screen.getByRole('slider', { name: 'Enquadramento da imagem' })
    mockBoundingBox(box)
    fireEvent.pointerDown(box, { clientX: 150, clientY: 25 }) // 75%, 25%

    expect(onChange).toHaveBeenCalledWith({
      featured: { x: 75, y: 25 },
      card: { x: 75, y: 25 },
      most_read: { x: 75, y: 25 },
    })
  })
})

describe('CoverFocalPointEditor — independent contexts', () => {
  it('only updates the active context tab, leaving the others untouched', () => {
    const value = { featured: { x: 20, y: 20 }, card: { x: 40, y: 40 }, most_read: { x: 60, y: 60 } }
    const onChange = vi.fn()
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={value} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mais Lidas' }))
    const box = screen.getByRole('slider', { name: 'Enquadramento da imagem' })
    mockBoundingBox(box)
    fireEvent.pointerDown(box, { clientX: 0, clientY: 0 }) // 0%, 0%

    expect(onChange).toHaveBeenCalledWith({
      featured: { x: 20, y: 20 },
      card: { x: 40, y: 40 },
      most_read: { x: 0, y: 0 },
    })
  })

  it('"Restaurar padrão" resets only the active context to {x:50,y:50}', () => {
    const value = { featured: { x: 20, y: 20 }, card: { x: 40, y: 40 }, most_read: { x: 60, y: 60 } }
    const onChange = vi.fn()
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={value} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Card padrão' }))
    fireEvent.click(screen.getByRole('button', { name: /restaurar padrão/i }))

    expect(onChange).toHaveBeenCalledWith({
      featured: { x: 20, y: 20 },
      card: { x: 50, y: 50 },
      most_read: { x: 60, y: 60 },
    })
  })

  it('arrow keys nudge only the active context (keyboard-accessible, not just drag)', () => {
    const value = { featured: { x: 20, y: 20 }, card: { x: 40, y: 40 }, most_read: { x: 60, y: 60 } }
    const onChange = vi.fn()
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={value} onChange={onChange} />)

    const box = screen.getByRole('slider', { name: 'Enquadramento da imagem' })
    fireEvent.keyDown(box, { key: 'ArrowRight' })

    expect(onChange).toHaveBeenCalledWith({
      featured: { x: 22, y: 20 },
      card: { x: 40, y: 40 },
      most_read: { x: 60, y: 60 },
    })
  })

  it('shift+arrow nudges by a bigger step', () => {
    const value = { featured: { x: 20, y: 20 }, card: { x: 40, y: 40 }, most_read: { x: 60, y: 60 } }
    const onChange = vi.fn()
    render(<CoverFocalPointEditor imageUrl={IMAGE_URL} value={value} onChange={onChange} />)

    const box = screen.getByRole('slider', { name: 'Enquadramento da imagem' })
    fireEvent.keyDown(box, { key: 'ArrowDown', shiftKey: true })

    expect(onChange).toHaveBeenCalledWith({
      featured: { x: 20, y: 30 },
      card: { x: 40, y: 40 },
      most_read: { x: 60, y: 60 },
    })
  })
})
