'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

type MediaItem = {
  id: string
  file_name: string
  file_url: string
  file_type: 'video' | 'image'
  duration_sec: number
}

export default function PlayerPage() {
  const params = useParams()
  const pairCode = params.code as string

  const [playlist, setPlaylist] = useState<MediaItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [screenId, setScreenId] = useState('')
  const [connected, setConnected] = useState(false)

  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await fetch(`/api/playlist?code=${pairCode}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setConnected(false)
        return
      }
      setScreenId(data.screenId)
      setPlaylist(data.playlist || [])
      setConnected(true)
      setError('')
      await fetch('/api/screen-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId: data.screenId, status: 'online' })
      })
    } catch {
      setConnected(false)
      setError('خطأ في الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }, [pairCode])

  useEffect(() => {
    fetchPlaylist()
    const interval = setInterval(fetchPlaylist, 30000)
    return () => clearInterval(interval)
  }, [fetchPlaylist])

  useEffect(() => {
    if (playlist.length === 0) return
    const current = playlist[currentIndex]
    if (!current) return
    const duration = (current.duration_sec || 15) * 1000
    const timer = setTimeout(async () => {
      if (screenId) {
        await fetch('/api/log-play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenId, mediaId: current.id, duration: current.duration_sec })
        })
      }
      setCurrentIndex(i => (i + 1) % playlist.length)
    }, duration)
    return () => clearTimeout(timer)
  }, [currentIndex, playlist, screenId])

  useEffect(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  if (loading) return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #333', borderTop: '3px solid #378ADD', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#666', marginTop: 16, fontSize: 14, fontFamily: 'Cairo, sans-serif' }}>جاري الاتصال...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error || !connected) return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      <p style={{ color: '#555', marginTop: 16, fontSize: 16, fontFamily: 'Cairo, sans-serif', textAlign: 'center' }}>
        {error || 'كود الشاشة غير صحيح'}
      </p>
      <p style={{ color: '#333', marginTop: 8, fontSize: 13, fontFamily: 'monospace', letterSpacing: 4 }}>{pairCode}</p>
      <p style={{ color: '#444', marginTop: 24, fontSize: 12, fontFamily: 'Cairo, sans-serif' }}>إعادة المحاولة كل 30 ثانية...</p>
    </div>
  )

  if (playlist.length === 0) return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      <p style={{ color: '#333', marginTop: 16, fontSize: 14, fontFamily: 'Cairo, sans-serif' }}>لا يوجد محتوى مجدول الآن</p>
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7a2e', animation: 'pulse 2s infinite' }} />
        <span style={{ color: '#333', fontSize: 11, fontFamily: 'monospace' }}>{pairCode}</span>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )

  const current = playlist[currentIndex]

  return (
    <div style={{ background: '#000', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {current.file_type === 'image' ? (
        <img
          key={current.id}
          src={current.file_url}
          alt={current.file_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <video
          key={current.id}
          src={current.file_url}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onEnded={() => setCurrentIndex(i => (i + 1) % playlist.length)}
        />
      )}

      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.4 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ color: '#fff', fontSize: 10, fontFamily: 'monospace' }}>{pairCode}</span>
      </div>

      {playlist.length > 1 && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 4, opacity: 0.4 }}>
          {playlist.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === currentIndex ? '#fff' : '#555' }} />
          ))}
        </div>
      )}
    </div>
  )
}

