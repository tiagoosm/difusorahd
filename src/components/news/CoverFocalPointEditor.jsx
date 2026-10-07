import { useState } from 'react'
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import {
  COVER_CONTEXTS,
  DEFAULT_FOCAL_POINT,
  MIN_ZOOM,
  MAX_ZOOM,
  getFocalPoint,
  toObjectPosition,
} from '../../utils/coverFocalPoint'

const CONTEXT_LABEL = { featured: 'Destaque', card: 'Card padrão', most_read: 'Mais Lidas' }
// Stand-in aspect ratio for each context's preview box — doesn't need to
// match every single consumer exactly (e.g. "featured" also covers the
// square secondary list in FeaturedNews), just be representative enough
// for the admin to judge the crop.
const CONTEXT_ASPECT = { featured: 'aspect-video', card: 'aspect-video', most_read: 'aspect-[3/2]' }
const ZOOM_STEP = 0.1

function isSamePoint(a, b) {
  return a.x === b.x && a.y === b.y && a.zoom === b.zoom
}

function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

// Drag-or-click-anywhere-in-the-box focal point picker: the box always
// shows the real crop (object-position + the same zoom transform the public
// site uses) at the current point, with a handle marking the focus and a
// pointer-driven update, acting like a 2D range input. Mouse wheel and a
// slider both adjust zoom, anchored at that same point — the crop never
// leaves a border, it only ever tightens from the "fills the box" floor.
function FocalPointBox({ imageUrl, point, onChange, aspectClassName }) {
  function updateFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100))
    onChange({ ...point, x: Math.round(x), y: Math.round(y) })
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

  function handleWheel(event) {
    event.preventDefault()
    onChange({ ...point, zoom: clampZoom(point.zoom - Math.sign(event.deltaY) * ZOOM_STEP) })
  }

  const position = toObjectPosition(point)
  const imgStyle = { objectPosition: position }
  if (point.zoom > 1) {
    imgStyle.transform = `scale(${point.zoom})`
    imgStyle.transformOrigin = position
  }

  return (
    <div
      role="slider"
      aria-label="Enquadramento da imagem"
      aria-valuetext={`${point.x}%, ${point.y}%, zoom ${point.zoom.toFixed(1)}x`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 10 : 2
        const deltas = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
        const delta = deltas[event.key]
        if (!delta) return
        event.preventDefault()
        onChange({
          ...point,
          x: Math.min(100, Math.max(0, point.x + delta[0])),
          y: Math.min(100, Math.max(0, point.y + delta[1])),
        })
      }}
      className={`relative w-full cursor-crosshair touch-none overflow-hidden rounded-lg bg-ink-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${aspectClassName}`}
    >
      <img src={imageUrl} alt="" draggable={false} className="h-full w-full object-cover select-none" style={imgStyle} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 shadow-card-hover"
        style={{ left: `${point.x}%`, top: `${point.y}%` }}
      />
    </div>
  )
}

const rangeThumbClass =
  '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-600'

function ZoomSlider({ zoom, onChange }) {
  const progressPct = ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100

  return (
    <div className="flex items-center gap-2">
      <ZoomOut className="h-3.5 w-3.5 shrink-0 text-ink-400" />
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.05}
        value={zoom}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Zoom"
        style={{
          background: `linear-gradient(to right, var(--color-brand-600) ${progressPct}%, var(--color-ink-200) ${progressPct}%)`,
        }}
        className={`h-1.5 flex-1 cursor-pointer appearance-none rounded-full ${rangeThumbClass}`}
      />
      <ZoomIn className="h-3.5 w-3.5 shrink-0 text-ink-400" />
      <span className="w-9 shrink-0 text-right text-xs text-ink-500 tabular-nums">{zoom.toFixed(1)}x</span>
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

  function handlePointChange(point) {
    if (sameForAll) updatePointForAll(point)
    else updateContext(activeContext, point)
  }

  if (!imageUrl) return null

  const activePoint = points[activeContext]

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
          point={activePoint}
          aspectClassName={CONTEXT_ASPECT[activeContext]}
          onChange={handlePointChange}
        />

        <ZoomSlider zoom={activePoint.zoom} onChange={(zoom) => handlePointChange({ ...activePoint, zoom })} />

        <span className="text-xs text-ink-400">
          Arraste, clique ou use a roda do mouse na imagem para ajustar foco e zoom.
        </span>
      </div>
    </div>
  )
}

export default CoverFocalPointEditor
