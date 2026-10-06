import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import toast from 'react-hot-toast'
import InsertMediaModal from './InsertMediaModal'

vi.mock('../../services/storage', async () => {
  const actual = await vi.importActual('../../services/storage')
  return { ...actual, uploadFile: vi.fn() }
})
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }))

import { uploadFile } from '../../services/storage'

function makeFile(name, size, type) {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

describe('InsertMediaModal — image/audio upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads the file to news-media/body/image and inserts src + caption', async () => {
    uploadFile.mockResolvedValue({ data: 'https://x/body/image/abc.png', error: null })
    const onInsert = vi.fn()

    render(<InsertMediaModal kind="image" isOpen onClose={() => {}} onInsert={onInsert} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [makeFile('foto.png', 100, 'image/png')] } })

    await waitFor(() => expect(uploadFile).toHaveBeenCalledWith('news-media', 'body/image', expect.any(File)))
    await screen.findByText('Trocar')

    fireEvent.change(screen.getByLabelText('Legenda (opcional)'), { target: { value: 'Foto: Divulgação' } })
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }))

    expect(onInsert).toHaveBeenCalledWith({ src: 'https://x/body/image/abc.png', caption: 'Foto: Divulgação' })
  })

  it('rejects a file over the 5MB image limit before uploading', async () => {
    render(<InsertMediaModal kind="image" isOpen onClose={() => {}} onInsert={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    const big = makeFile('foto.png', 6 * 1024 * 1024, 'image/png')
    fireEvent.change(input, { target: { files: [big] } })

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('O arquivo excede o limite de 5 MB.'))
    expect(uploadFile).not.toHaveBeenCalled()
  })

  it('shows a translated error message when the upload itself fails', async () => {
    uploadFile.mockResolvedValue({ data: null, error: { message: 'mime type text/plain is not supported' } })

    render(<InsertMediaModal kind="image" isOpen onClose={() => {}} onInsert={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [makeFile('foto.txt', 10, 'text/plain')] } })

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Formato não suportado. Envie um arquivo em JPG, PNG, WEBP ou GIF.'),
    )
  })
})

describe('InsertMediaModal — video', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a YouTube URL as provider=youtube with the resolved embed URL', () => {
    const onInsert = vi.fn()
    render(<InsertMediaModal kind="video" isOpen onClose={() => {}} onInsert={onInsert} />)

    fireEvent.change(screen.getByLabelText('URL do vídeo'), {
      target: { value: 'https://youtu.be/dQw4w9WgXcQ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }))

    expect(onInsert).toHaveBeenCalledWith({
      url: 'https://youtu.be/dQw4w9WgXcQ',
      provider: 'youtube',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      caption: null,
    })
  })

  it('shows an inline error instead of inserting when the URL is invalid', () => {
    const onInsert = vi.fn()
    render(<InsertMediaModal kind="video" isOpen onClose={() => {}} onInsert={onInsert} />)

    fireEvent.change(screen.getByLabelText('URL do vídeo'), { target: { value: 'not a url' } })
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }))

    expect(screen.getByText('URL inválida.')).toBeInTheDocument()
    expect(onInsert).not.toHaveBeenCalled()
  })
})
