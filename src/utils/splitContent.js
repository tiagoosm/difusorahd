// Divide o HTML da notícia em duas metades, cortando sempre depois do fechamento
// de um bloco (parágrafo, título, lista, citação) — nunca no meio de uma tag.
export function splitContentAtMiddle(html) {
  if (!html) return { first: '', second: '' }

  const blocks = html.split(/(?<=<\/(?:p|h1|h2|h3|ul|ol|blockquote)>)/i)

  if (blocks.length < 2) return { first: html, second: '' }

  const midpoint = Math.ceil(blocks.length / 2)

  return {
    first: blocks.slice(0, midpoint).join(''),
    second: blocks.slice(midpoint).join(''),
  }
}
