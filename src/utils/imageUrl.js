// Redimensiona imagens do Supabase Storage sob demanda via o endpoint de
// transformação (/render/image/ em vez de /object/), evitando servir o
// arquivo original (às vezes vários MB) pra um card de 300px de largura.
// Confirmado que a transformação está habilitada neste projeto antes de
// usar isso em produção.
const OBJECT_PATH = '/storage/v1/object/public/'
const RENDER_PATH = '/storage/v1/render/image/public/'

export function optimizedImageUrl(url, { width, quality = 75 } = {}) {
  if (!url || !url.includes(OBJECT_PATH)) return url

  const transformed = url.replace(OBJECT_PATH, RENDER_PATH)
  const params = new URLSearchParams({ quality: String(quality) })
  if (width) params.set('width', String(width))

  return `${transformed}?${params}`
}

// Gera o atributo srcset com uma variante por largura, para o navegador
// escolher a menor imagem suficiente pra tela/densidade do visitante.
export function buildSrcSet(url, widths) {
  if (!url || !url.includes(OBJECT_PATH)) return undefined
  return widths.map((width) => `${optimizedImageUrl(url, { width })} ${width}w`).join(', ')
}
