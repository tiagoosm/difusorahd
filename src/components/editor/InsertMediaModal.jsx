import { useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { uploadFile, MAX_SIZE_MB, describeUploadError } from '../../services/storage'
import { parseVideoUrl } from '../../utils/videoEmbed'

const TITLE = { image: 'Inserir imagem', audio: 'Inserir áudio', video: 'Inserir vídeo' }

// Shared by the editor toolbar's "Imagem / Vídeo / Áudio" buttons — inserts
// a new media block at the cursor position. Image/audio upload straight
// away to news-media/body/<kind> (same Storage mechanism FileUpload uses);
// video has no upload step, see utils/videoEmbed.js.
function InsertMediaModal({ kind, isOpen, onClose, onInsert }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [src, setSrc] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoError, setVideoError] = useState('')
  const [caption, setCaption] = useState('')

  function reset() {
    setSrc(null)
    setVideoUrl('')
    setVideoError('')
    setCaption('')
  }

  function handleClose() {
    reset()
    onClose()
  }

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
    const { data, error } = await uploadFile('news-media', `body/${kind}`, file)
    setUploading(false)

    if (error) {
      toast.error(describeUploadError(error, kind))
      return
    }
    setSrc(data)
  }

  function handleInsert() {
    if (kind === 'video') {
      const parsed = parseVideoUrl(videoUrl)
      if (parsed.error) {
        setVideoError(parsed.error)
        return
      }
      onInsert({ url: parsed.url, provider: parsed.provider, embedUrl: parsed.embedUrl, caption: caption || null })
    } else {
      if (!src) {
        toast.error(kind === 'image' ? 'Envie uma imagem.' : 'Envie um arquivo de áudio.')
        return
      }
      onInsert({ src, caption: caption || null })
    }
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={TITLE[kind]}>
      <div className="flex flex-col gap-4">
        {kind === 'video' ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="video-url" className="text-sm font-medium text-ink-700">
              URL do vídeo
            </label>
            <Input
              id="video-url"
              placeholder="https://youtube.com/watch?v=... ou link direto do arquivo"
              value={videoUrl}
              onChange={(event) => {
                setVideoUrl(event.target.value)
                setVideoError('')
              }}
              error={videoError}
            />
            <span className="text-xs text-ink-500">Aceita links do YouTube, Vimeo ou um arquivo de vídeo direto.</span>
          </div>
        ) : src ? (
          <div className="flex items-center gap-3 rounded-lg border border-ink-300 p-3">
            {kind === 'image' ? (
              <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <audio src={src} controls className="h-10 flex-1" />
            )}
            <button
              type="button"
              onClick={() => setSrc(null)}
              className="ml-auto text-xs font-medium text-ink-500 hover:text-brand-600"
            >
              Trocar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 py-6 text-sm text-ink-500 hover:border-brand-400 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? 'Enviando...' : 'Clique para enviar um arquivo'}
          </button>
        )}

        {kind !== 'video' && (
          <input
            ref={inputRef}
            type="file"
            accept={kind === 'image' ? 'image/*' : 'audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm,.flac'}
            onChange={handleFileChange}
            className="hidden"
          />
        )}

        <Input
          id="media-caption"
          label="Legenda (opcional)"
          placeholder="Ex: Foto: Divulgação"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleInsert} disabled={uploading}>
            Inserir
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default InsertMediaModal
