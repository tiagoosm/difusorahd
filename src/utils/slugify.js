export function slugify(text) {
  const withoutDiacritics = text
    .normalize('NFD')
    .split('')
    .filter((char) => char.codePointAt(0) < 0x0300 || char.codePointAt(0) > 0x036f)
    .join('')

  return withoutDiacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
