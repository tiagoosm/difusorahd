import { useState } from 'react'
import { Play, Square, Loader2, Volume2, VolumeX, RefreshCw, X } from 'lucide-react'
import { useLiveRadio } from '../../hooks/useLiveRadio'

const STATUS_COLOR = {
  warning: 'text-amber-600',
  error: 'text-red-600',
}

// Floating mini-player for the live radio — lives outside the pages' flow
// (mounted once in PublicLayout) to survive route changes without
// restarting the audio. Collapsed by default: only play/pause + the "on
// air" indicator stay always visible; volume/status open in a panel when expanded.
function RadioBar() {
  const {
    isPlaying,
    isLoading,
    statusText,
    statusMode,
    showRetry,
    volume,
    isMuted,
    play,
    stop,
    retry,
    setVolume,
    toggleMute,
  } = useLiveRadio()

  const [isExpanded, setIsExpanded] = useState(false)

  function togglePlayback() {
    if (isPlaying) stop()
    else play()
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
      {isExpanded && (
        <div className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-200 bg-white p-4 shadow-card-hover">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-ink-900">Rádio Difusora HD</p>
              <p aria-live="polite" className={`text-xs ${STATUS_COLOR[statusMode] ?? 'text-ink-500'}`}>
                {statusText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Recolher player da rádio"
              className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {showRetry && (
            <button
              type="button"
              onClick={retry}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-ink-200 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Tentar novamente
            </button>
          )}

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
              className="shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-200 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-600"
            />
          </div>
        </div>
      )}

      {/* Two sibling <button>s, not one nested inside the other: a real
          button inside another breaks keyboard focus and screen reader
          reading — that's why the "pill" is a <div>, not a <button>. */}
      <div className="flex items-center gap-1 rounded-full bg-brand-700 p-1 pr-4 text-white shadow-card-hover">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Parar rádio ao vivo' : 'Tocar rádio ao vivo'}
          aria-pressed={isPlaying}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-700 transition-transform hover:scale-105"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Recolher player da rádio ao vivo' : 'Abrir player da rádio ao vivo'}
          className="flex items-center gap-1.5 rounded-full py-1.5 pl-1 text-xs font-semibold whitespace-nowrap hover:text-white/85"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
              isPlaying ? 'animate-pulse bg-red-500' : 'bg-white/40'
            }`}
            aria-hidden="true"
          />
          {isPlaying ? 'No ar' : 'Ao vivo'}
        </button>
      </div>
    </div>
  )
}

export default RadioBar
