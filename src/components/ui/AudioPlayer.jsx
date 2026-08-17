import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, AlertTriangle } from 'lucide-react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// Player custom (sem biblioteca — só a <audio> nativa por trás) com cara de
// player de podcast/rádio, para o áudio fazer parte da experiência editorial
// em vez do <audio controls> genérico do navegador, que varia de aparência
// entre Chrome/Firefox/Safari e não carrega nenhuma identidade do portal.
function AudioPlayer({ src }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleTimeUpdate() {
      setCurrentTime(audio.currentTime)
    }
    function handleLoadedMetadata() {
      setDuration(audio.duration)
    }
    function handleEnded() {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setHasError(true))
    }
  }

  function handleSeek(event) {
    const value = Number(event.target.value)
    audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  function handleVolumeChange(event) {
    const value = Number(event.target.value)
    audioRef.current.volume = value
    setVolume(value)
    setIsMuted(value === 0)
  }

  function toggleMute() {
    const audio = audioRef.current
    const nextMuted = !isMuted
    audio.volume = nextMuted ? 0 : volume || 1
    setIsMuted(nextMuted)
  }

  if (hasError) {
    return (
      <p className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-ink-50 p-4 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Não foi possível reproduzir o áudio neste navegador.
      </p>
    )
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const rangeThumbClass =
    '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-600'

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-card sm:p-5">
      <audio ref={audioRef} src={src} preload="metadata" onError={() => setHasError(true)} />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-transform hover:scale-105 hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none sm:h-12 sm:w-12"
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Progresso do áudio"
          style={{
            background: `linear-gradient(to right, var(--color-brand-600) ${progressPct}%, var(--color-ink-200) ${progressPct}%)`,
          }}
          className={`h-1.5 w-full cursor-pointer appearance-none rounded-full ${rangeThumbClass}`}
        />
        <div className="flex justify-between text-xs text-ink-500 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none"
        >
          {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          className={`h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-ink-200 ${rangeThumbClass}`}
        />
      </div>
    </div>
  )
}

export default AudioPlayer
