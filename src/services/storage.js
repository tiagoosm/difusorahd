import { supabase } from './supabase'

const BUCKET = 'news-media'

export async function uploadFile(file, folder) {
  const extension = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) return { data: null, error }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { data: data.publicUrl, error: null }
}
