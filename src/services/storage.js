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
