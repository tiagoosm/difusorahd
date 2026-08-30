import { supabase } from './supabase'

// Fallback only for when the browser/OS can't identify the file type
// (file.type comes back empty) — very common with M4A/AAC on Windows,
// which has no registered MIME association for those extensions. Without
// this, the upload goes out with a generic content-type
// (application/octet-stream), which the bucket rejects even though the
// format is supported.
const MIME_BY_EXTENSION = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  webm: 'audio/webm',
  flac: 'audio/flac',
}

// Extracts the file's internal path (e.g. "covers/abc.png") from the
// public URL Storage returns, so .remove() can be called on it.
export function extractStoragePath(publicUrl, bucket) {
  if (!publicUrl) return null
  const marker = `/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  return index === -1 ? null : publicUrl.slice(index + marker.length)
}

// Removes a file from Storage from the public URL saved in the database.
// Best-effort: the caller decides whether a failure here should block the
// main operation (in general it shouldn't — the record itself has already
// been saved/deleted).
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
