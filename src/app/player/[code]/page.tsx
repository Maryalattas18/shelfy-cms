'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

type MediaItem = {
  id: string
  file_name: string
  file_url: string
  file_type: 'video' | 'image'
  duration_sec: number
}

type PlayerState = 'loading' | 'error' | 'idle' | 'playing'

export default function PlayerPage() {
  const params = useParams()
  const pairCode = params.code as string

  const [playlist, setPlaylist] = useState<MediaItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [playerState, setPlayerState] = useState<PlayerState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [screenId, setScreenId] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [clock, setClock] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ─── Clock ───────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, '0')
      const m = now.getMinutes().toString().padStart(2, '0')
      const s = now.getSeconds().toString().padStart(2, '0')
      setClock(`${h}:${m}:${s}`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // ─── Fetch Playlist ──────────────────────────────────
  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await fetch(`/api/playlist?code=${pairCode}`)
      const data = await res.json()
      if (data.error) {
        setErrorMsg(data.error)
        setPlayerState('error')
        return
      }
      setScreenId(data.screenId)
      setRetryCount(0)
      const items: MediaItem[] = data.playlist || []
      setPlaylist(prev => {
        // حدّث الـ playlist بدون إعادة تشغيل العنصر الحالي
        if (JSON.stringify(prev) !== JSON.stringify(items)) {
          if (items.length === 0) {
            setPlayerState('idle')
          } else {
            setPlayerState('playing')
            if (prev.length === 0) setCurrentIndex(0)
          }
          return items
        }
        return prev
      })
      if (items.length === 0) setPlayerState('idle')
      else setPlayerState('playing')
      setErrorMsg('')
    } catch {
      setRetryCount(r => r + 1)
      setPlayerState('error')
      setErrorMsg('انقطع الاتصال بالسيرفر')
    }
  }, [pairCode])

  // جلب الـ playlist عند البدء وكل 30 ثانية
  useEffect(() => {
    fetchPlaylist()
    const delay = Math.min(30000, 10000 + retryCount * 5000)
    const interval = setInterval(fetchPlaylist, delay)
    return () => clearInterval(interval)
  }, [fetchPlaylist, retryCount])

  // ─── Preload Next Image ──────────────────────────────
  useEffect(() => {
    if (playlist.length <= 1) return
    const next = playlist[(currentIndex + 1) % playlist.length]
    if (next?.file_type === 'image') {
      const img = new window.Image()
      img.src = next.file_url
    }
  }, [currentIndex, playlist])

  // ─── Progress Bar ────────────────────────────────────
  const startProgress = useCallback((durationSec: number) => {
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(0)
    const steps = 100
    const interval = (durationSec * 1000) / steps
    let step = 0
    progressRef.current = setInterval(() => {
      step++
      setProgress((step / steps) * 100)
      if (step >= steps && progressRef.current) clearInterval(progressRef.current)
    }, interval)
  }, [])

  // ─── Advance to Next Slide ───────────────────────────
  const advance = useCallback(async (fromIndex: number, pl: MediaItem[], sid: string) => {
    const current = pl[fromIndex]
    if (!current || !sid) return

    // سجّل العرض
    fetch('/api/log-play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenId: sid, mediaId: current.id, duration: current.duration_sec })
    }).catch(() => {})

    // انتقال سلس
    setTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(i => {
        const next = (i + 1) % pl.length
        setNextIndex((next + 1) % pl.length)
        return next
      })
      setTransitioning(false)
    }, 400)
  }, [])

  // ─── Media Timer ─────────────────────────────────────
  useEffect(() => {
    if (playerState !== 'playing' || playlist.length === 0) return
    const current = playlist[currentIndex]
    if (!current) return

    if (current.file_type === 'image') {
      startProgress(current.duration_sec)
      if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current)
      mediaTimerRef.current = setTimeout(() => {
        advance(currentIndex, playlist, screenId)
      }, current.duration_sec * 1000)
    }
    // للفيديو: يتقدم عبر onEnded

    return () => {
      if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [currentIndex, playerState, playlist, screenId, advance, startProgress])

  // ─── Fullscreen ──────────────────────────────────────
  const enterFullscreen = () => {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
  }

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // ────────────────────────────────────────────────────
  const current = playlist[currentIndex]

  // ─── Loading ─────────────────────────────────────────
  if (playerState === 'loading') return (
    <div style={S.screen}>
      <div style={S.spinner} />
      <p style={{ ...S.label, marginTop: 20 }}>جاري الاتصال...</p>
      <style>{SPIN_CSS}</style>
    </div>
  )

  // ─── Error ───────────────────────────────────────────
  if (playerState === 'error') return (
    <div style={S.screen} onClick={enterFullscreen}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
      <p style={{ ...S.label, marginTop: 16, color: '#444' }}>{errorMsg}</p>
      <p style={{ ...S.label, marginTop: 8, color: '#222', fontSize: 11 }}>
        إعادة المحاولة خلال {Math.min(30, 10 + retryCount * 5)} ث...
      </p>
      <div style={S.codeTag}>{pairCode}</div>
      <style>{SPIN_CSS}</style>
    </div>
  )

  // ─── Idle ─────────────────────────────────────────────
  if (playerState === 'idle' || playlist.length === 0) return (
    <div style={S.screen} onClick={enterFullscreen}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#1a1a1a', fontSize: 72, fontFamily: 'monospace', letterSpacing: 4, fontWeight: 700 }}>
          {clock}
        </p>
        <p style={{ color: '#2a2a2a', fontSize: 13, fontFamily: 'Cairo, sans-serif', marginTop: 16 }}>
          لا يوجد محتوى مجدول الآن
        </p>
      </div>
      <div style={S.codeTag}>
        <span style={S.dot} />
        {pairCode}
      </div>
      <style>{SPIN_CSS}</style>
    </div>
  )

  // ─── Playing ─────────────────────────────────────────
  return (
    <div style={S.screen} onClick={!fullscreen ? enterFullscreen : undefined}>

      {/* Current Media */}
      <div style={{ ...S.mediaWrap, opacity: transitioning ? 0 : 1, transition: 'opacity 0.4s ease' }}>
        {current?.file_type === 'image' ? (
          <img
            key={`img-${currentIndex}`}
            src={current.file_url}
            alt=""
            style={S.media}
          />
        ) : (
          <video
            key={`vid-${currentIndex}`}
            ref={videoRef}
            src={current?.file_url}
            autoPlay
            muted
            playsInline
            style={S.media}
            onEnded={() => advance(currentIndex, playlist, screenId)}
            onError={() => {
              if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current)
              setTimeout(() => advance(currentIndex, playlist, screenId), 500)
            }}
          />
        )}
      </div>

      {/* Progress Bar */}
      {current?.file_type === 'image' && (
        <div style={S.progressTrack}>
          <div style={{ ...S.progressFill, width: `${progress}%` }} />
        </div>
      )}

      {/* Bottom Bar */}
      <div style={S.bottomBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={S.dot} />
          <span style={{ color: '#ffffff99', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2 }}>
            {pairCode}
          </span>
        </div>
        {playlist.length > 1 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {playlist.map((_, i) => (
              <div key={i} style={{
                width: i === currentIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentIndex ? '#fff' : '#ffffff33',
                transition: 'width 0.3s ease, background 0.3s ease'
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen hint */}
      {!fullscreen && (
        <div style={S.fsHint} onClick={enterFullscreen}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
          </svg>
          fullscreen
        </div>
      )}

      <style>{SPIN_CSS}</style>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  screen: {
    background: '#000',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'default',
  },
  mediaWrap: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: '#ffffff22',
    zIndex: 10,
  },
  progressFill: {
    height: '100%',
    background: '#fff',
    transition: 'width 0.3s linear',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  dot: {
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
    animation: 'pulse 2s infinite',
  },
  label: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Cairo, sans-serif',
    textAlign: 'center',
  },
  codeTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#333',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  spinner: {
    width: 44,
    height: 44,
    border: '3px solid #1a1a1a',
    borderTop: '3px solid #378ADD',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  fsHint: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#ffffff55',
    fontSize: 10,
    fontFamily: 'monospace',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    background: '#ffffff11',
    zIndex: 10,
  },
}

const SPIN_CSS = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.9)} }
`
