import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Editor from './Editor'

describe('Editor — media toolbar', () => {
  it('opens the matching "Inserir" modal for each of the 3 media buttons', async () => {
    render(<Editor value="" onChange={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Inserir imagem'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Inserir imagem' })).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Fechar'))

    fireEvent.click(screen.getByLabelText('Inserir vídeo'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Inserir vídeo' })).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Fechar'))

    fireEvent.click(screen.getByLabelText('Inserir áudio'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Inserir áudio' })).toBeInTheDocument())
  })

  it('inserts a video block at the cursor and reports the new HTML via onChange', async () => {
    const onChange = vi.fn()
    render(<Editor value="<p>Olá</p>" onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('Inserir vídeo'))
    await waitFor(() => expect(screen.getByLabelText('URL do vídeo')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('URL do vídeo'), { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }))

    await waitFor(() => {
      const lastCall = onChange.mock.calls.at(-1)?.[0]
      expect(lastCall).toContain('data-content-block="video"')
      expect(lastCall).toContain('data-provider="youtube"')
    })
  })
})
