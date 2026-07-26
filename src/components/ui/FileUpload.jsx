import { useRef, useState } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadFile } from '../../services/storage'

const MAX_SIZE_MB = { image: 5, audio: 20 }

function FileUpload({ value, onChange, bucket, folder, accept, kind = 'image', label }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const maxBytes = MAX_SIZE_MB[kind] * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`O arquivo excede o limite de ${MAX_SIZE_MB[kind]} MB.`)
      return
    }

    setUploading(true)
    const { data: url, error } = await uploadFile(bucket, folder, file)
    setUploading(false)

    if (error) {
      toast.error('Não foi possível enviar o arquivo.')
      return
    }

    onChange(url)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-3">
          {kind === 'image' ? (
            <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <audio src={value} controls className="h-10 flex-1" />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remover arquivo"
            className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
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
