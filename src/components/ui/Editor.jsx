import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Image as ImageIcon,
  Video,
  Music,
} from 'lucide-react'
import { MediaImage, MediaAudio, MediaVideo } from '../editor/mediaNodes'
import InsertMediaModal from '../editor/InsertMediaModal'

const NODE_TYPE_BY_KIND = { image: 'mediaImage', audio: 'mediaAudio', video: 'mediaVideo' }

function ToolbarButton({ onClick, isActive, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        isActive ? 'bg-brand-100 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
      }`}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor, onInsertMedia }) {
  if (!editor) return null

  function setLink() {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link', previousUrl || 'https://')

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink-200 p-2">
      <ToolbarButton
        label="Negrito"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Itálico"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Título"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista com marcadores"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Link" onClick={setLink} isActive={editor.isActive('link')}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-ink-200" />

      <ToolbarButton label="Inserir imagem" onClick={() => onInsertMedia('image')}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Inserir vídeo" onClick={() => onInsertMedia('video')}>
        <Video className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Inserir áudio" onClick={() => onInsertMedia('audio')}>
        <Music className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-ink-200" />

      <ToolbarButton
        label="Desfazer"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Refazer"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

function Editor({ value, onChange, placeholder = 'Escreva o conteúdo da notícia...' }) {
  const [mediaModalKind, setMediaModalKind] = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-600 underline' } }),
      Placeholder.configure({ placeholder }),
      MediaImage,
      MediaAudio,
      MediaVideo,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-gray max-w-none min-h-[240px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  // Inserts the media block at wherever the cursor currently is (the
  // admin positions it by clicking in the text first, then picks a type).
  // If that leaves the block as the very last node, a trailing empty
  // paragraph is appended too — otherwise there'd be no way to click past
  // an atom node to keep writing below it.
  function handleInsertMedia(attrs) {
    if (!editor) return
    const type = NODE_TYPE_BY_KIND[mediaModalKind]

    editor.chain().focus().insertContent({ type, attrs }).run()

    const { state } = editor
    const lastChild = state.doc.lastChild
    if (lastChild && lastChild.type.name === type) {
      editor.chain().insertContentAt(state.doc.content.size, { type: 'paragraph' }).run()
    }

    setMediaModalKind(null)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30">
      <EditorToolbar editor={editor} onInsertMedia={setMediaModalKind} />
      <EditorContent editor={editor} />

      <InsertMediaModal
        kind={mediaModalKind}
        isOpen={Boolean(mediaModalKind)}
        onClose={() => setMediaModalKind(null)}
        onInsert={handleInsertMedia}
      />
    </div>
  )
}

export default Editor
