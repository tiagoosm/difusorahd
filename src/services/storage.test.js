import { describe, it, expect } from 'vitest'
import { extractStoragePath } from './storage'

describe('extractStoragePath', () => {
  it('extracts the internal path from a Supabase Storage public URL', () => {
    const url =
      'https://hamuwuaaswddfkezasbg.supabase.co/storage/v1/object/public/news-media/covers/abc-123.png'
    expect(extractStoragePath(url, 'news-media')).toBe('covers/abc-123.png')
  })

  it('returns null when the URL does not belong to the given bucket', () => {
    const url =
      'https://hamuwuaaswddfkezasbg.supabase.co/storage/v1/object/public/ads-images/banners/abc.png'
    expect(extractStoragePath(url, 'news-media')).toBeNull()
  })

  it('returns null for empty/nullish input (nothing to clean up)', () => {
    expect(extractStoragePath('', 'news-media')).toBeNull()
    expect(extractStoragePath(null, 'news-media')).toBeNull()
    expect(extractStoragePath(undefined, 'news-media')).toBeNull()
  })
})
