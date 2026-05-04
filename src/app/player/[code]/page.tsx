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
  const [isOffline, setIsOffline] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const keepAliveVideoRef = useRef<HTMLVideoElement>(null)
  const wakeLockRef = useRef<any>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const prevIndexRef = useRef(-1)
  const transitioningRef = useRef(false)
  const playlistRef = useRef<MediaItem[]>([])
  const screenIdRef = useRef('')

  // ─── Web Audio silent oscillator (keep-alive عبر audio output) ────
  // webOS Hub أحياناً يحس بالـaudio output كـ"إشارة نشطة" ولا ينام
  const initAudioKeepAlive = () => {
    if (audioCtxRef.current) return
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctx) return
      const ctx: AudioContext = new Ctx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0.0001 // عملياً صامت لكن audio stream موجود
      osc.frequency.value = 20  // تردد منخفض جداً (تحت مدى السمع)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      audioCtxRef.current = ctx
      oscillatorRef.current = osc
    } catch {}
  }

  // ─── Wake Lock + Keep-Alive (منع الشاشة من النوم) ────
  // مُحسَّن خصيصاً لتلفزيونات webOS Hub (PRIME / LG)
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          if (wakeLockRef.current) {
            try { await wakeLockRef.current.release() } catch {}
          }
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        }
      } catch {}
    }

    requestWakeLock()

    // أعد طلب Wake Lock كل 30 ثانية
    const wakeLockInterval = setInterval(requestWakeLock, 30_000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // keep-alive video: تأكد إنه يلعب باستمرار + حركة CSS
    const keepAliveInterval = setInterval(() => {
      const el = keepAliveVideoRef.current
      if (el) {
        el.play().catch(() => {})
        // إذا الفيديو توقف لأي سبب، أعد تحميله
        if (el.paused || el.ended) {
          el.currentTime = 0
          el.play().catch(() => {})
        }
      }
      document.documentElement.style.opacity = '0.9999'
      requestAnimationFrame(() => { document.documentElement.style.opacity = '1' })
    }, 15_000)

    // محاكاة نشاط مستخدم كل 15ث (يخدع نظام كشف عدم النشاط في webOS Hub)
    const fakeActivityInterval = setInterval(() => {
      try {
        const x = Math.floor(Math.random() * window.innerWidth)
        const y = Math.floor(Math.random() * window.innerHeight)
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }))
        document.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }))
        window.dispatchEvent(new Event('focus'))
        document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Shift', code: 'ShiftLeft' }))
        document.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Shift', code: 'ShiftLeft' }))
      } catch {}
    }, 15_000)

    // DOM mutation + reflow كل 5ث (يجبر التلفزيون يحس بتغير على الشاشة)
    const mutationInterval = setInterval(() => {
      const marker = document.getElementById('keepalive-marker')
      if (marker) {
        marker.textContent = String(Date.now() % 1000)
        marker.style.transform = `translateX(${Math.random().toFixed(3)}px) translateY(${Math.random().toFixed(3)}px)`
      }
      // force layout reflow
      void document.body.offsetHeight
    }, 5_000)

    return () => {
      clearInterval(wakeLockInterval)
      clearInterval(keepAliveInterval)
      clearInterval(fakeActivityInterval)
      clearInterval(mutationInterval)
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

  // ─── Cache Helpers (localStorage) ────────────────────
  const cacheKey = `shelfy_cache_${pairCode}`

  const saveToCache = (data: any) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        screenId: data.screenId,
        orientation: data.orientation || 'landscape',
        fitMode: data.fitMode || 'cover',
        playlist: data.playlist || [],
        cachedAt: Date.now(),
      }))
    } catch {}
  }

  const loadFromCache = (): any => {
    try {
      const raw = localStorage.getItem(cacheKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  // ─── Fetch Playlist ──────────────────────────────────
  const fetchPlaylist = useCallback(async () => {
    try {
      // cache-busting + no-cache headers لمنع Fully Kiosk من كاش الـAPI
      const res = await fetch(`/api/playlist?code=${pairCode}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      })
      const data = await res.json()
      if (data.error) {
        // خطأ من السيرفر (مو شبكة) — نعرض الخطأ
        setErrorMsg(data.error)
        setPlayerState('error')
        setIsOffline(false)
        return
      }
      // نجح الاتصال — احفظ في الكاش
      saveToCache(data)
      setIsOffline(false)
      setScreenId(data.screenId)
      setOrientation(data.orientation || 'landscape')
      setFitMode(data.fitMode || 'cover')
      setRetryCount(0)
      const items: MediaItem[] = data.playlist || []
      setPlaylist(prev => {
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
      // فشل الشبكة — جرّب الكاش بدل ما تعرض شاشة خطأ
      setRetryCount(r => r + 1)
      setIsOffline(true)

      // إذا عندنا playlist شغالة، خلّيها تكمل بصمت
      if (playlistRef.current.length > 0) return

      // ما عندنا playlist في الذاكرة — حمّل من localStorage
      const cached = loadFromCache()
      if (cached && cached.playlist?.length > 0) {
        setScreenId(cached.screenId || '')
        setOrientation(cached.orientation || 'landscape')
        setFitMode(cached.fitMode || 'cover')
        setPlaylist(cached.playlist)
        setPlayerState('playing')
        setErrorMsg('')
        return
      }

      // لا playlist ولا كاش — اعرض شاشة الخطأ
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

  // ─── Keep refs in sync ───────────────────────────────
  useEffect(() => { playlistRef.current = playlist }, [playlist])
  useEffect(() => { screenIdRef.current = screenId }, [screenId])

  // ─── Preload Next Image ──────────────────────────────
  useEffect(() => {
    if (playlist.length <= 1) return
    const next = playlist[(currentIndex + 1) % playlist.length]
    if (next?.file_type === 'image') {
      const img = new window.Image()
      img.src = next.file_url
    }
  }, [currentIndex, playlist])

  // ─── Time-based index calculation ────────────────────
  // نفس الخوارزمية المستخدمة في /api/screen-now لضمان التزامن
  const calcIndex = useCallback((pl: MediaItem[]): { index: number; progress: number } => {
    if (!pl.length) return { index: 0, progress: 0 }
    const totalMs = pl.reduce((s, it) => s + it.duration_sec * 1000, 0)
    if (!totalMs) return { index: 0, progress: 0 }
    const nowMs = Date.now()
    const saudiMs = nowMs + 3 * 3600000
    const dayMs = Math.floor(saudiMs / 86400000) * 86400000
    const midnightUtc = dayMs - 3 * 3600000
    const pos = (nowMs - midnightUtc) % totalMs
    let acc = 0
    for (let i = 0; i < pl.length; i++) {
      const dur = pl[i].duration_sec * 1000
      if (pos < acc + dur) return { index: i, progress: ((pos - acc) / dur) * 100 }
      acc += dur
    }
    return { index: 0, progress: 0 }
  }, [])

  // ─── Tick: sync index with time ──────────────────────
  useEffect(() => {
    if (playerState !== 'playing') return

    const tick = () => {
      const pl = playlistRef.current
      if (!pl.length) return
      const { index, progress } = calcIndex(pl)
      setProgress(progress)

      if (index !== prevIndexRef.current) {
        // سجّل انتهاء العنصر السابق
        if (prevIndexRef.current !== -1 && screenIdRef.current) {
          const prev = pl[prevIndexRef.current]
          if (prev) {
            fetch('/api/log-play', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ screenId: screenIdRef.current, mediaId: prev.id, duration: prev.duration_sec })
            }).catch(() => {})
          }
        }
        // انتقال سلس
        if (!transitioningRef.current) {
          transitioningRef.current = true
          setTransitioning(true)
          setTimeout(() => {
            setCurrentIndex(index)
            setTransitioning(false)
            transitioningRef.current = false
          }, 400)
        }
        prevIndexRef.current = index
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [playerState, calcIndex])

  // ─── Fullscreen ──────────────────────────────────────
  const enterFullscreen = () => {
    const el = document.documentElement
    initAudioKeepAlive()
    if (el.requestFullscreen) el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
  }

  // ─── Auto-init audio keep-alive on first interaction ─
  useEffect(() => {
    const handler = () => initAudioKeepAlive()
    document.addEventListener('click', handler, { once: false })
    document.addEventListener('touchstart', handler, { once: false })
    document.addEventListener('keydown', handler, { once: false })
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('keydown', handler)
    }
  }, [])

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
                autoPlay muted playsInline loop
                style={mediaStyle}
                onEnded={(e) => {
                  // إذا الفيديو خلص قبل وقته المخصص، يعيد التشغيل تلقائياً (loop)
                  const v = e.currentTarget
                  v.currentTime = 0
                  v.play().catch(() => {})
                }}
                onError={(e) => {
                  // إذا فشل تحميل الفيديو، نحاول إعادة التحميل بعد ثانية
                  const v = e.currentTarget
                  setTimeout(() => { v.load(); v.play().catch(() => {}) }, 1000)
                }}
              />
            )
          })()}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={S.bottomBar}>
        {/* نقطة الحالة: خضراء = أونلاين، برتقالية = أوفلاين */}
        <span style={{ ...S.dot, background: isOffline ? '#f59e0b' : '#22c55e', boxShadow: `0 0 4px ${isOffline ? '#f59e0b' : '#22c55e'}` }} />
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

      {/* فيديو keep-alive — مرئي صغير في زاوية الشاشة (webOS Hub لازمه يكون داخل viewport) */}
      <video
        ref={keepAliveVideoRef}
        src={KEEP_ALIVE_VIDEO}
        loop autoPlay muted playsInline
        style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: 4,
          height: 4,
          opacity: 0.02,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />

      {/* عنصر متحرك يتغير محتواه + موضعه باستمرار — webOS يحسه نشاط */}
      <div
        id="keepalive-marker"
        style={{
          position: 'absolute',
          bottom: 1,
          right: 8,
          width: 3,
          height: 3,
          opacity: 0.05,
          pointerEvents: 'none',
          animation: 'keepAwake 2s linear infinite',
          background: '#fff',
          borderRadius: '50%',
          color: 'transparent',
          fontSize: 1,
          zIndex: 100,
          willChange: 'transform',
        }}
      >0</div>


      <style>{SPIN_CSS + KEEP_AWAKE_CSS}</style>
    </div>
  )
}

// فيديو صامت 1×1 بيكسل مشفّر كـ base64 (يمنع النوم على Android)
const KEEP_ALIVE_VIDEO = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1NSByMjkxNyAwYTg0ZDk4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxOCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAPWWIhAAv//72rvzLK0cLlS4teMiRe8m6oE0IAAADAAAMB0d8aNKAAAADAAADAAAAAwAAAwAAAwAKAAAAA0AAABQAAA=='

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

const KEEP_AWAKE_CSS = `
  @keyframes keepAwake {
    0%   { transform: translate(0px, 0px) scale(1); }
    25%  { transform: translate(2px, 0px) scale(1.2); }
    50%  { transform: translate(2px, 2px) scale(1); }
    75%  { transform: translate(0px, 2px) scale(0.8); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes scanLine {
    0%   { top: 100%; }
    100% { top: 0%; }
  }
`
