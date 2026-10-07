import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { COVER_CONTEXTS, DEFAULT_FOCAL_POINT, getFocalPoint, toObjectPosition } from '../../utils/coverFocalPoint'

const CONTEXT_LABEL = { featured: 'Destaque', card: 'Card padrão', most_read: 'Mais Lidas' }
// Stand-in aspect ratio for each context's preview box — doesn't need to
// match every single consumer exactly (e.g. "featured" also covers the
// square secondary list in FeaturedNews), just be representative enough
// for the admin to judge the crop.
const CONTEXT_ASPECT = { featured: 'aspect-video', card: 'aspect-video', most_read: 'aspect-square' }

function isSamePoint(a, b) {
  return a.x === b.x && a.y === b.y
}

// Drag-or-click-anywhere-in-the-box focal point picker: the box always
// shows the real object-cover crop at the current point (so it's a true
// preview, not a separate "pick a spot" abstraction), with a handle marking
// the point and a pointer-driven update, acting like a 2D range input.
function FocalPointBox({ imageUrl, point, onChange, aspectClassName }) {
  function updateFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100))
    onChange({ x: Math.round(x), y: Math.round(y) })
  }

  function handlePointerDown(event) {
    // Not implemented in jsdom (tests), and Pointer Events are young enough
    // that guarding it costs nothing even in real browsers.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    updateFromPointer(event)
  }

  function handlePointerMove(event) {
    if (event.buttons !== 1) return
    updateFromPointer(event)
  }

  return (
    <div
      role="slider"
      aria-label="Enquadramento da imagem"
      aria-valuetext={`${point.x}%, ${point.y}%`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 10 : 2
        const deltas = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
        const delta = deltas[event.key]
        if (!delta) return
        event.preventDefault()
        onChange({
          x: Math.min(100, Math.max(0, point.x + delta[0])),
          y: Math.min(100, Math.max(0, point.y + delta[1])),
        })
      }}
      className={`relative w-full cursor-crosshair touch-none overflow-hidden rounded-lg bg-ink-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${aspectClassName}`}
    >
      <img
        src={imageUrl}
        alt=""
        draggable={false}
        className="h-full w-full object-cover select-none"
        style={{ objectPosition: toObjectPosition(point) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 shadow-card-hover"
        style={{ left: `${point.x}%`, top: `${point.y}%` }}
      />
    </div>
  )
}

// value: the raw cover_focal_points jsonb ({ featured, card, most_read } —
// any/all keys optional) or null. onChange receives the same shape back.
function CoverFocalPointEditor({ imageUrl, value, onChange }) {
  const points = {
    featured: getFocalPoint(value, 'featured'),
    card: getFocalPoint(value, 'card'),
    most_read: getFocalPoint(value, 'most_read'),
  }
  const allEqual = isSamePoint(points.featured, points.card) && isSamePoint(points.card, points.most_read)

  const [sameForAll, setSameForAll] = useState(allEqual)
  const [activeContext, setActiveContext] = useState('featured')

  function updateContext(context, point) {
    onChange({ ...points, [context]: point })
  }

  function updatePointForAll(point) {
    onChange({ featured: point, card: point, most_read: point })
  }

  function handleSameForAllToggle(event) {
    const checked = event.target.checked
    setSameForAll(checked)
    if (checked) updatePointForAll(points[activeContext])
  }

  function resetContext(context) {
    if (sameForAll) {
      updatePointForAll(DEFAULT_FOCAL_POINT)
    } else {
      updateContext(context, DEFAULT_FOCAL_POINT)
    }
  }

  if (!imageUrl) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-700">Enquadramento da capa</span>
        <label className="flex items-center gap-2 text-xs text-ink-600">
          <input
            type="checkbox"
            checked={sameForAll}
            onChange={handleSameForAllToggle}
            className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
          />
          Usar o mesmo enquadramento em todos
        </label>
      </div>

      {!sameForAll && (
        <div className="flex gap-1.5">
          {COVER_CONTEXTS.map((context) => (
            <button
              key={context}
              type="button"
              onClick={() => setActiveContext(context)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeContext === context
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {CONTEXT_LABEL[context]}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:max-w-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-500">
            {sameForAll ? 'Todos os contextos' : CONTEXT_LABEL[activeContext]}
          </span>
          <button
            type="button"
            onClick={() => resetContext(activeContext)}
            className="flex items-center gap-1 text-xs text-ink-500 hover:text-brand-600"
          >
            <RotateCcw className="h-3 w-3" />
            Restaurar padrão
          </button>
        </div>

        <FocalPointBox
          imageUrl={imageUrl}
          point={points[activeContext]}
          aspectClassName={CONTEXT_ASPECT[activeContext]}
          onChange={(point) => (sameForAll ? updatePointForAll(point) : updateContext(activeContext, point))}
        />

        <span className="text-xs text-ink-400">Arraste ou clique na imagem para escolher o foco.</span>
      </div>
    </div>
  )
}

export default CoverFocalPointEditor
