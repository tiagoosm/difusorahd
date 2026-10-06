import { useRef, useState } from 'react'
import { Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadFile, MAX_SIZE_MB, describeUploadError } from '../../services/storage'
import { parseVideoUrl } from '../../utils/videoEmbed'

// Every in-body media block lives under news-media/body/<kind> — kept apart
// from covers/ and audio/ (the standalone cover image and "Ouça esta
// notícia" narration) so the two concerns don't mix in Storage.
async function uploadBodyFile(kind, file) {
  const maxBytes = MAX_SIZE_MB[kind] * 1024 * 1024
  if (file.size > maxBytes) {
    return { data: null, error: { message: `O arquivo excede o limite de ${MAX_SIZE_MB[kind]} MB.` }, tooLarge: true }
  }
  const { data, error } = await uploadFile('news-media', `body/${kind}`, file)
  return { data, error, tooLarge: false }
}

function MediaToolbar({ onEdit, onRemove, editLabel = 'Substituir' }) {
  return (
    <div
      className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover/media:opacity-100 focus-within:opacity-100"
      contentEditable={false}
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
        className="rounded-lg bg-white/90 p-1.5 text-ink-600 shadow-card hover:bg-white hover:text-brand-700"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover"
        title="Remover"
        className="rounded-lg bg-white/90 p-1.5 text-ink-600 shadow-card hover:bg-white hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function CaptionInput({ value, onChange }) {
  return (
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value || null)}
      placeholder="Legenda (opcional)"
      contentEditable={false}
      className="mt-2 w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs text-ink-600 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
    />
  )
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

function ImageNodeView({ node, updateAttributes, deleteNode }) {
  const { src, caption } = node.attrs
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleReplace(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    const { data, error } = await uploadBodyFile('image', file)
    setUploading(false)

    if (error) {
      toast.error(describeUploadError(error, 'image'))
      return
    }
    updateAttributes({ src: data })
  }

  return (
    <NodeViewWrapper className="content-media-nodeview group/media relative my-2" data-drag-handle>
      <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
        <img src={src} alt={caption || ''} className="block max-h-[420px] w-full object-contain" />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          </div>
        )}
        <MediaToolbar onEdit={() => inputRef.current?.click()} onRemove={deleteNode} />
      </div>
      <CaptionInput value={caption} onChange={(value) => updateAttributes({ caption: value })} />
      <input ref={inputRef} type="file" accept="image/*" onChange={handleReplace} className="hidden" />
    </NodeViewWrapper>
  )
}

export const MediaImage = Node.create({
  name: 'mediaImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      caption: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-content-block="image"]',
        getAttrs: (dom) => ({
          src: dom.getAttribute('data-src'),
          caption: dom.getAttribute('data-caption') || null,
        }),
      },
    ]
  },

  renderHTML({ node }) {
    const { src, caption } = node.attrs
    const children = [['img', { src, loading: 'lazy', decoding: 'async', alt: caption || '' }]]
    if (caption) children.push(['figcaption', {}, caption])
    return [
      'figure',
      { 'data-content-block': 'image', 'data-src': src, 'data-caption': caption || '', class: 'content-media content-image' },
      ...children,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

function AudioNodeView({ node, updateAttributes, deleteNode }) {
  const { src, caption } = node.attrs
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleReplace(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    const { data, error } = await uploadBodyFile('audio', file)
    setUploading(false)

    if (error) {
      toast.error(describeUploadError(error, 'audio'))
      return
    }
    updateAttributes({ src: data })
  }

  return (
    <NodeViewWrapper className="content-media-nodeview group/media relative my-2" data-drag-handle>
      <div className="relative rounded-xl border border-ink-200 bg-ink-50 p-3">
        <audio key={src} src={src} controls preload="metadata" className="w-full" />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          </div>
        )}
        <MediaToolbar onEdit={() => inputRef.current?.click()} onRemove={deleteNode} />
      </div>
      <CaptionInput value={caption} onChange={(value) => updateAttributes({ caption: value })} />
      <input ref={inputRef} type="file" accept="audio/*" onChange={handleReplace} className="hidden" />
    </NodeViewWrapper>
  )
}

export const MediaAudio = Node.create({
  name: 'mediaAudio',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      caption: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-content-block="audio"]',
        getAttrs: (dom) => ({
          src: dom.getAttribute('data-src'),
          caption: dom.getAttribute('data-caption') || null,
        }),
      },
    ]
  },

  renderHTML({ node }) {
    const { src, caption } = node.attrs
    const children = [['audio', { src, controls: 'true', preload: 'metadata' }]]
    if (caption) children.push(['figcaption', {}, caption])
    return [
      'figure',
      { 'data-content-block': 'audio', 'data-src': src, 'data-caption': caption || '', class: 'content-media content-audio' },
      ...children,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView)
  },
})

// ---------------------------------------------------------------------------
// Video (URL embed — no upload, see utils/videoEmbed.js)
// ---------------------------------------------------------------------------

function VideoNodeView({ node, updateAttributes, deleteNode }) {
  const { url, provider, embedUrl, caption } = node.attrs
  const [editing, setEditing] = useState(false)
  const [draftUrl, setDraftUrl] = useState(url)
  const [draftError, setDraftError] = useState('')

  function confirmEdit() {
    const parsed = parseVideoUrl(draftUrl)
    if (parsed.error) {
      setDraftError(parsed.error)
      return
    }
    updateAttributes({ url: parsed.url, provider: parsed.provider, embedUrl: parsed.embedUrl })
    setEditing(false)
    setDraftError('')
  }

  return (
    <NodeViewWrapper className="content-media-nodeview group/media relative my-2" data-drag-handle>
      <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-ink-900">
        {provider === 'file' ? (
          <video src={url} controls preload="metadata" className="block aspect-video w-full" />
        ) : (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title="Vídeo incorporado"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}
        <MediaToolbar onEdit={() => setEditing(true)} onRemove={deleteNode} editLabel="Editar URL" />
      </div>

      {editing && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-ink-200 p-2.5" contentEditable={false}>
          <input
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-ink-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
          />
          {draftError && <span className="text-xs text-red-500">{draftError}</span>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmEdit}
              className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setDraftUrl(url)
                setDraftError('')
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <CaptionInput value={caption} onChange={(value) => updateAttributes({ caption: value })} />
    </NodeViewWrapper>
  )
}

export const MediaVideo = Node.create({
  name: 'mediaVideo',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      provider: { default: 'file' },
      embedUrl: { default: null },
      caption: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-content-block="video"]',
        getAttrs: (dom) => ({
          url: dom.getAttribute('data-url'),
          provider: dom.getAttribute('data-provider') || 'file',
          embedUrl: dom.getAttribute('data-embed-url') || null,
          caption: dom.getAttribute('data-caption') || null,
        }),
      },
    ]
  },

  renderHTML({ node }) {
    const { url, provider, embedUrl, caption } = node.attrs
    const player =
      provider === 'file'
        ? ['video', { src: url, controls: 'true', preload: 'metadata' }]
        : ['iframe', { src: embedUrl, title: 'Vídeo incorporado', allowfullscreen: 'true', class: 'content-video-frame' }]

    const children = [player]
    if (caption) children.push(['figcaption', {}, caption])

    return [
      'figure',
      {
        'data-content-block': 'video',
        'data-url': url,
        'data-provider': provider,
        'data-embed-url': embedUrl || '',
        'data-caption': caption || '',
        class: 'content-media content-video',
      },
      ...children,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView)
  },
})
