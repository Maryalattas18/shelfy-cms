'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

type MediaItem = {
  id: string
  file_name: string
  file_url: string
  file_type: 'video' | 'image'
  duration_sec: number
  fit_mode?: string
  object_position?: string
  transform?: { x: number; y: number; scale: number; rotate: number } | null
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
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('cover')

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wakeLockRef = useRef<any>(null)

  // ─── Wake Lock (منع الشاشة من النوم) ─────────────────
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        }
      } catch {}
    }
    requestWakeLock()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      wakeLockRef.current?.release()
    }
  }, [])

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
      setOrientation(data.orientation || 'landscape')
      setFitMode(data.fitMode || 'cover')
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
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(orientation === 'portrait' ? {
            transform: 'rotate(90deg)',
            width: '100vh',
            height: '100vw',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-50vw',
            marginLeft: '-50vh',
          } : {}),
        }}>
          {(() => {
            const t = current?.transform
            const mediaStyle: React.CSSProperties = t
              ? {
                  position: 'absolute', top: '50%', left: '50%',
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: `translate(calc(-50% + ${t.x}%), calc(-50% + ${t.y}%)) scale(${t.scale}) rotate(${t.rotate}deg)`,
                  transformOrigin: 'center center',
                }
              : { ...S.media, objectFit: (current?.fit_mode || fitMode) as any, objectPosition: current?.object_position || 'center center' }

            return current?.file_type === 'image' ? (
              <img key={`img-${currentIndex}`} src={current.file_url} alt="" style={mediaStyle} />
            ) : (
              <video
                key={`vid-${currentIndex}`}
                ref={videoRef}
                src={current?.file_url}
                autoPlay muted playsInline
                style={mediaStyle}
                onEnded={() => advance(currentIndex, playlist, screenId)}
                onError={() => {
                  if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current)
                  setTimeout(() => advance(currentIndex, playlist, screenId), 500)
                }}
              />
            )
          })()}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={S.bottomBar}>
        {/* نقطة خضراء صغيرة جداً */}
        <span style={S.dot} />
        {/* مؤشر الإعلانات — خفيف جداً */}
        {playlist.length > 1 && (
          <div style={{ display: 'flex', gap: 2, opacity: 0.18 }}>
            {playlist.map((_, i) => (
              <div key={i} style={{
                width: i === currentIndex ? 8 : 3,
                height: 2,
                borderRadius: 1,
                background: '#fff',
                transition: 'width 0.3s ease',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px 14px 10px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 10,
    background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)',
  },
  dot: {
    display: 'inline-block',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 4px #22c55e',
    opacity: 0.6,
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
