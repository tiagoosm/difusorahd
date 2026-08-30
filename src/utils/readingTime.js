// Simple reading-time estimate from the article body's HTML — 200
// words/min is the usual average for reading in Portuguese.
const WORDS_PER_MINUTE = 200

export function estimateReadingTime(html) {
  if (!html) return 1

  const text = html.replace(/<[^>]+>/g, ' ')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
