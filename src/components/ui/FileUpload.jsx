import { useRef, useState } from 'react'
import { UploadCloud, X, Loader2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadFile } from '../../services/storage'

const MAX_SIZE_MB = { image: 5, audio: 20 }

const FORMAT_HINT = {
  image: 'JPG, PNG, WEBP ou GIF',
  audio: 'MP3, WAV, OGG, M4A, AAC, WEBM ou FLAC',
}

// Traduz o erro cru do Supabase Storage numa mensagem que explica a causa
// real (formato não suportado, arquivo grande demais, sessão sem permissão)
// em vez de um "não foi possível enviar" genérico.
function describeUploadError(error, kind) {
  const message = error?.message || ''

  if (/exceeded the maximum allowed size|payload too large/i.test(message)) {
    return `O arquivo excede o limite de ${MAX_SIZE_MB[kind]} MB.`
  }
  if (/mime type .* is not supported/i.test(message)) {
    return `Formato não suportado. Envie um arquivo em ${FORMAT_HINT[kind]}.`
  }
  if (/row-level security|not authorized|jwt/i.test(message)) {
    return 'Sem permissão para enviar arquivos. Faça login novamente.'
  }
  if (/network|failed to fetch/i.test(message)) {
    return 'Falha de conexão durante o envio. Verifique sua internet e tente novamente.'
  }

  return message ? `Não foi possível enviar o arquivo: ${message}` : 'Não foi possível enviar o arquivo.'
}

function FileUpload({ value, onChange, bucket, folder, accept, kind = 'image', label }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [playbackError, setPlaybackError] = useState(false)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const maxBytes = MAX_SIZE_MB[kind] * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`O arquivo excede o limite de ${MAX_SIZE_MB[kind]} MB.`)
      return
    }

    setPlaybackError(false)
    setUploading(true)
    const { data: url, error } = await uploadFile(bucket, folder, file)
    setUploading(false)

    if (error) {
      toast.error(describeUploadError(error, kind))
      return
    }

    onChange(url)
  }

  function handleRemove() {
    setPlaybackError(false)
    onChange('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

      {value ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-3">
            {kind === 'image' ? (
              <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <audio
                key={value}
                src={value}
                controls
                className="h-10 flex-1"
                onError={() => setPlaybackError(true)}
              />
            )}
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remover arquivo"
              className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {playbackError && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Este navegador não conseguiu reproduzir o arquivo enviado. Ele pode funcionar em outros
              navegadores, mas considere usar MP3 para máxima compatibilidade.
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-6 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? 'Enviando...' : 'Clique para enviar um arquivo'}
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </div>
  )
}

export default FileUpload
