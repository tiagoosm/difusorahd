import { describe, it, expect } from 'vitest'
import { generateHTML, generateJSON } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { MediaImage, MediaAudio, MediaVideo } from './mediaNodes'

// Tests the Tiptap schema directly (parseHTML -> doc -> renderHTML), not a
// mounted editor — this is what actually determines whether a saved news
// article's content survives save -> reload -> edit -> save again, the
// core correctness requirement for the whole block system.
const EXTENSIONS = [StarterKit, MediaImage, MediaAudio, MediaVideo]

function roundTrip(html) {
  return generateHTML(generateJSON(html, EXTENSIONS), EXTENSIONS)
}

describe('MediaImage — parse/render round-trip', () => {
  it('preserves src and caption through a full round-trip', () => {
    const html =
      '<p>Antes</p><figure data-content-block="image" data-src="https://x/a.png" data-caption="Foto: X"><img src="https://x/a.png"><figcaption>Foto: X</figcaption></figure><p>Depois</p>'

    const result = roundTrip(html)

    expect(result).toContain('data-content-block="image"')
    expect(result).toContain('data-src="https://x/a.png"')
    expect(result).toContain('data-caption="Foto: X"')
    expect(result).toContain('<img src="https://x/a.png"')
    expect(result).toContain('<figcaption>Foto: X</figcaption>')
    // Surrounding text blocks are untouched and stay in order.
    expect(result.indexOf('Antes')).toBeLessThan(result.indexOf('content-image'))
    expect(result.indexOf('content-image')).toBeLessThan(result.indexOf('Depois'))
  })

  it('omits figcaption entirely when there is no caption', () => {
    const html = '<figure data-content-block="image" data-src="https://x/a.png"><img src="https://x/a.png"></figure>'

    const result = roundTrip(html)

    expect(result).not.toContain('figcaption')
  })
})

describe('MediaAudio — parse/render round-trip', () => {
  it('preserves src and caption through a full round-trip', () => {
    const html =
      '<figure data-content-block="audio" data-src="https://x/a.mp3" data-caption="Entrevista"><audio src="https://x/a.mp3" controls></audio><figcaption>Entrevista</figcaption></figure>'

    const result = roundTrip(html)

    expect(result).toContain('data-content-block="audio"')
    expect(result).toContain('data-src="https://x/a.mp3"')
    expect(result).toContain('<figcaption>Entrevista</figcaption>')
  })
})

describe('MediaVideo — parse/render round-trip', () => {
  it('preserves a YouTube embed (provider + embedUrl) through a round-trip', () => {
    const html =
      '<figure data-content-block="video" data-url="https://youtube.com/watch?v=abc123" data-provider="youtube" data-embed-url="https://www.youtube-nocookie.com/embed/abc123"><iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe></figure>'

    const result = roundTrip(html)

    expect(result).toContain('data-provider="youtube"')
    expect(result).toContain('data-url="https://youtube.com/watch?v=abc123"')
    expect(result).toContain('<iframe src="https://www.youtube-nocookie.com/embed/abc123"')
  })

  it('preserves a direct file video (provider=file) as a <video> tag', () => {
    const html =
      '<figure data-content-block="video" data-url="https://x/clip.mp4" data-provider="file"><video src="https://x/clip.mp4" controls></video></figure>'

    const result = roundTrip(html)

    expect(result).toContain('data-provider="file"')
    expect(result).toContain('<video src="https://x/clip.mp4"')
  })
})

describe('Backward compatibility — existing (pre-blocks) article content', () => {
  it('leaves plain paragraphs/headings/lists untouched (no media blocks involved)', () => {
    // <li>Item</li> round-trips to <li><p>Item</p></li> — that's StarterKit's
    // own ListItem behavior, unchanged by the media nodes added here.
    const html = '<p>Texto <strong>normal</strong>.</p><h2>Subtítulo</h2><ul><li><p>Item</p></li></ul>'

    const result = roundTrip(html)

    expect(result).toBe(html)
  })

  it('round-trips a full text -> image -> text -> video -> text -> audio -> text sequence in order', () => {
    const html = [
      '<p>Parágrafo 1</p>',
      '<figure data-content-block="image" data-src="https://x/1.png"><img src="https://x/1.png"></figure>',
      '<p>Parágrafo 2</p>',
      '<figure data-content-block="video" data-url="https://x/clip.mp4" data-provider="file"><video src="https://x/clip.mp4" controls></video></figure>',
      '<p>Parágrafo 3</p>',
      '<figure data-content-block="audio" data-src="https://x/a.mp3"><audio src="https://x/a.mp3" controls></audio></figure>',
      '<p>Parágrafo 4</p>',
    ].join('')

    const result = roundTrip(html)

    const order = ['Parágrafo 1', 'content-image', 'Parágrafo 2', 'content-video', 'Parágrafo 3', 'content-audio', 'Parágrafo 4']
    const positions = order.map((marker) => result.indexOf(marker))

    expect(positions.every((pos) => pos !== -1)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })
})
