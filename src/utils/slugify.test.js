import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Título da Notícia')).toBe('titulo-da-noticia')
  })

  it('strips accents/diacritics', () => {
    expect(slugify('São Sebastião da Bela Vista')).toBe('sao-sebastiao-da-bela-vista')
  })

  it('removes punctuation not allowed in a slug', () => {
    expect(slugify('CAC divulga 1.522 vagas de emprego!')).toBe('cac-divulga-1522-vagas-de-emprego')
  })

  it('collapses repeated separators into a single hyphen', () => {
    expect(slugify('a   b---c')).toBe('a-b-c')
  })

  it('trims leading/trailing whitespace before slugifying', () => {
    expect(slugify('  título  ')).toBe('titulo')
  })
})
