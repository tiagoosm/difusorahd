import { describe, it, expect } from 'vitest'
import { optimizedImageUrl, buildSrcSet } from './imageUrl'

const PUBLIC_URL = 'https://project.supabase.co/storage/v1/object/public/news-media/covers/a.png'

describe('optimizedImageUrl', () => {
  it('rewrites the object path to the render/image path with width and quality params', () => {
    const result = optimizedImageUrl(PUBLIC_URL, { width: 400 })
    expect(result).toBe(
      'https://project.supabase.co/storage/v1/render/image/public/news-media/covers/a.png?quality=75&width=400',
    )
  })

  it('omits the width param when none is given', () => {
    const result = optimizedImageUrl(PUBLIC_URL, {})
    expect(result).not.toContain('width=')
  })

  it('returns falsy input unchanged', () => {
    expect(optimizedImageUrl(null)).toBeNull()
    expect(optimizedImageUrl(undefined)).toBeUndefined()
    expect(optimizedImageUrl('')).toBe('')
  })

  it('returns URLs that are not Supabase Storage object URLs unchanged (no transform endpoint to rewrite to)', () => {
    const external = 'https://example.com/some-image.png'
    expect(optimizedImageUrl(external, { width: 400 })).toBe(external)
  })
})

describe('buildSrcSet', () => {
  it('builds one descriptor per width, in the given order', () => {
    const result = buildSrcSet(PUBLIC_URL, [400, 800])
    expect(result).toBe(
      'https://project.supabase.co/storage/v1/render/image/public/news-media/covers/a.png?quality=75&width=400 400w, ' +
        'https://project.supabase.co/storage/v1/render/image/public/news-media/covers/a.png?quality=75&width=800 800w',
    )
  })

  it('returns undefined for a falsy url (matches the img srcSet default)', () => {
    expect(buildSrcSet(null, [400])).toBeUndefined()
    expect(buildSrcSet('', [400])).toBeUndefined()
  })

  it('returns undefined for a non-Supabase-Storage url', () => {
    expect(buildSrcSet('https://example.com/some-image.png', [400])).toBeUndefined()
  })
})
