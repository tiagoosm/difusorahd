import { describe, it, expect } from 'vitest'
import { parseVideoUrl } from './videoEmbed'

describe('parseVideoUrl — YouTube', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('recognizes %s as YouTube id %s', (url, id) => {
    const result = parseVideoUrl(url)
    expect(result.provider).toBe('youtube')
    expect(result.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${id}`)
    expect(result.error).toBeUndefined()
  })
})

describe('parseVideoUrl — Vimeo', () => {
  it('recognizes a vimeo.com URL and builds the player.vimeo.com embed URL', () => {
    const result = parseVideoUrl('https://vimeo.com/76979871')
    expect(result.provider).toBe('vimeo')
    expect(result.embedUrl).toBe('https://player.vimeo.com/video/76979871')
  })
})

describe('parseVideoUrl — direct file', () => {
  it('treats any other https URL as a direct video file (no embedUrl)', () => {
    const result = parseVideoUrl('https://cdn.example.com/videos/entrevista.mp4')
    expect(result.provider).toBe('file')
    expect(result.url).toBe('https://cdn.example.com/videos/entrevista.mp4')
    expect(result.embedUrl).toBeNull()
  })
})

describe('parseVideoUrl — invalid input', () => {
  it.each([['not a url'], ['javascript:alert(1)'], ['ftp://example.com/video.mp4'], ['']])(
    'rejects %s with an error instead of a provider',
    (input) => {
      const result = parseVideoUrl(input)
      expect(result.error).toBeTruthy()
      expect(result.provider).toBeUndefined()
    },
  )
})
