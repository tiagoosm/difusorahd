import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getStoredRadioVolume,
  getStoredRadioMuted,
  storeRadioVolume,
  storeRadioMuted,
  DEFAULT_RADIO_VOLUME,
} from '../utils/radioStorage'

const STREAM_URL = import.meta.env.VITE_RADIO_STREAM_URL
const MAX_ATTEMPTS = 5
const BASE_DELAY_MS = 1500 // 1.5s, 3s, 6s, 12s, 24s
const STATION_NAME = 'Rádio Difusora HD'

// Player da rádio ao vivo: um único <audio> imperativo (não preso a nenhuma
// página) com reconexão em backoff exponencial — precisa sobreviver à troca
// de rota (por isso é montado uma vez em PublicLayout, não numa página).
export function useLiveRadio() {
  const audioRef = useRef(null)
  // Padrão recomendado pelo React pra criar um valor caro uma única vez sem
  // useEffect nem useMemo: guarda condicional no corpo do componente.
  if (audioRef.current === null) {
    audioRef.current = new Audio()
    audioRef.current.preload = 'none'
  }

  const userWantsPlayingRef = useRef(false)
  const attemptRef = useRef(0)
  const reconnectTimerRef = useRef(null)
  const lastVolumeRef = useRef(getStoredRadioVolume())
  // scheduleReconnect chama a versão mais recente de startStream sem os dois
  // precisarem depender um do outro como useCallback (dependência circular).
  const startStreamRef = useRef(() => {})

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('Pronto para tocar')
  const [statusMode, setStatusMode] = useState(null)
  const [showRetry, setShowRetry] = useState(false)
  const [volume, setVolumeState] = useState(lastVolumeRef.current)
  const [isMuted, setIsMuted] = useState(getStoredRadioMuted())

  const setStatus = useCallback((text, mode = null) => {
    setStatusText(text)
    setStatusMode(mode)
  }, [])

  // Aplica volume/mudo salvos assim que o <audio> existe — antes da primeira
  // reprodução, pra já começar no volume que o ouvinte deixou da última vez.
  useEffect(() => {
    const audio = audioRef.current
    audio.volume = isMuted ? 0 : volume
    audio.muted = isMuted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (!userWantsPlayingRef.current) return

    if (!navigator.onLine) {
      setIsLoading(false)
      setStatus('Sem internet — aguardando rede', 'error')
      return
    }

    if (attemptRef.current >= MAX_ATTEMPTS) {
      setIsLoading(false)
      setIsPlaying(false)
      setStatus('Falha ao conectar', 'error')
      setShowRetry(true)
      return
    }

    attemptRef.current += 1
    const delay = BASE_DELAY_MS * 2 ** (attemptRef.current - 1)
    setIsLoading(true)
    setStatus(`Reconectando… (${attemptRef.current}/${MAX_ATTEMPTS})`, 'warning')
    clearTimeout(reconnectTimerRef.current)
    reconnectTimerRef.current = setTimeout(() => startStreamRef.current(), delay)
  }, [setStatus])

  const startStream = useCallback(() => {
    if (!navigator.onLine) {
      setStatus('Sem conexão com a internet', 'error')
      return
    }

    userWantsPlayingRef.current = true
    setShowRetry(false)
    setIsLoading(true)
    setStatus(attemptRef.current > 0 ? 'Reconectando…' : 'Conectando…')

    const audio = audioRef.current
    // Cache-bust: evita que o navegador reuse uma conexão de stream morta
    // depois de uma queda.
    audio.src = `${STREAM_URL}${STREAM_URL.includes('?') ? '&' : '?'}_=${Date.now()}`
    audio.load()

    const playPromise = audio.play()
    if (playPromise?.catch) {
      playPromise.catch(() => {
        if (userWantsPlayingRef.current) scheduleReconnect()
      })
    }
  }, [scheduleReconnect, setStatus])

  useEffect(() => {
    startStreamRef.current = startStream
  }, [startStream])

  const stopStream = useCallback((userInitiated) => {
    userWantsPlayingRef.current = false
    attemptRef.current = 0
    clearTimeout(reconnectTimerRef.current)
    setShowRetry(false)
    const audio = audioRef.current
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    setIsPlaying(false)
    setIsLoading(false)
    if (userInitiated) setStatus('Pronto para tocar')
  }, [setStatus])

  const play = useCallback(() => {
    attemptRef.current = 0
    startStream()
  }, [startStream])

  const stop = useCallback(() => {
    stopStream(true)
  }, [stopStream])

  const retry = useCallback(() => {
    attemptRef.current = 0
    setShowRetry(false)
    startStream()
  }, [startStream])

  // Eventos do <audio> — registrados uma única vez (o elemento nunca troca).
  useEffect(() => {
    const audio = audioRef.current

    function handleWaiting() {
      if (userWantsPlayingRef.current) setIsLoading(true)
    }

    function handlePlaying() {
      attemptRef.current = 0
      setShowRetry(false)
      setIsLoading(false)
      setIsPlaying(true)
      setStatus('Ao vivo agora')
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: STATION_NAME,
            artist: 'Ao vivo agora',
          })
        } catch {
          // MediaMetadata pode não existir em navegadores mais antigos.
        }
      }
    }

    function handlePause() {
      if (userWantsPlayingRef.current) return
      setIsPlaying(false)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
    }

    function handleErrorOrStalled() {
      if (userWantsPlayingRef.current) scheduleReconnect()
    }

    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleErrorOrStalled)
    audio.addEventListener('stalled', handleErrorOrStalled)

    return () => {
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleErrorOrStalled)
      audio.removeEventListener('stalled', handleErrorOrStalled)
    }
  }, [scheduleReconnect, setStatus])

  // Rede caiu/voltou: pausa as tentativas enquanto offline, retoma sozinho
  // ao voltar (só se o ouvinte já tinha pedido pra tocar).
  useEffect(() => {
    function handleOffline() {
      clearTimeout(reconnectTimerRef.current)
      setIsLoading(false)
      setIsPlaying(false)
      setStatus('Sem conexão com a internet', 'error')
    }

    function handleOnline() {
      if (userWantsPlayingRef.current) {
        attemptRef.current = 0
        setStatus('Conexão restabelecida…', 'warning')
        startStreamRef.current()
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [setStatus])

  // Controles de mídia da tela de bloqueio/notificação (celular): permite
  // pausar/retomar a rádio sem abrir o site de novo.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', play)
    navigator.mediaSession.setActionHandler('pause', stop)
    navigator.mediaSession.setActionHandler('stop', stop)
    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('stop', null)
    }
  }, [play, stop])

  useEffect(() => () => clearTimeout(reconnectTimerRef.current), [])

  const setVolume = useCallback((value) => {
    const clamped = Math.min(1, Math.max(0, value))
    const audio = audioRef.current
    audio.volume = clamped
    audio.muted = clamped === 0
    setVolumeState(clamped)
    setIsMuted(clamped === 0)
    if (clamped > 0) lastVolumeRef.current = clamped
    storeRadioVolume(clamped)
    storeRadioMuted(clamped === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    setIsMuted((wasMuted) => {
      const nextMuted = !wasMuted
      if (nextMuted) {
        lastVolumeRef.current = audio.volume || lastVolumeRef.current
        audio.muted = true
      } else {
        audio.muted = false
        audio.volume = lastVolumeRef.current || DEFAULT_RADIO_VOLUME
        setVolumeState(audio.volume)
      }
      storeRadioMuted(nextMuted)
      return nextMuted
    })
  }, [])

  return {
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
  }
}
