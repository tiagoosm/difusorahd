// Estimativa simples de tempo de leitura a partir do HTML do corpo da
// notícia — 200 palavras/min é a média usual para leitura em português.
const WORDS_PER_MINUTE = 200

export function estimateReadingTime(html) {
  if (!html) return 1

  const text = html.replace(/<[^>]+>/g, ' ')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
