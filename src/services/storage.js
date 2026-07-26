import { supabase } from './supabase'

export async function uploadFile(bucket, folder, file) {
  const extension = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) return { data: null, error }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { data: data.publicUrl, error: null }
}
