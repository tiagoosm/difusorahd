import { supabase } from './supabase'

// Fallback só para quando o navegador/SO não consegue identificar o tipo do
// arquivo (file.type vem vazio) — muito comum com M4A/AAC no Windows, que
// não tem associação de MIME registrada para essas extensões. Sem isso, o
// upload vai com content-type genérico (application/octet-stream), que o
// bucket rejeita mesmo o formato sendo suportado.
const MIME_BY_EXTENSION = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  webm: 'audio/webm',
  flac: 'audio/flac',
}

// Extrai o caminho interno do arquivo (ex: "covers/abc.png") a partir da
// URL pública que o Storage retorna, para poder chamar .remove() nele.
export function extractStoragePath(publicUrl, bucket) {
  if (!publicUrl) return null
  const marker = `/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  return index === -1 ? null : publicUrl.slice(index + marker.length)
}

// Remove um arquivo do Storage a partir da URL pública salva no banco.
// Best-effort: quem chama decide se uma falha aqui deve bloquear a operação
// principal (em geral não deve — o registro em si já foi salvo/excluído).
export async function removeFile(bucket, publicUrl) {
  const path = extractStoragePath(publicUrl, bucket)
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}

export async function uploadFile(bucket, folder, file) {
  const extension = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const contentType = file.type || MIME_BY_EXTENSION[extension?.toLowerCase()] || undefined

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    ...(contentType ? { contentType } : {}),
  })

  if (error) return { data: null, error }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { data: data.publicUrl, error: null }
}
