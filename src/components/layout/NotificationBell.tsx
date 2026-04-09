'use client'
import { useEffect, useRef, useState } from 'react'

type Notif = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, string> = {
  screen_online:    '🟢',
  screen_offline:   '🔴',
  campaign_ended:   '📋',
  campaign_starting:'📢',
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)   return 'الآن'
  if (diff < 3600) return `${Math.floor(diff / 60)} د`
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`
  return `${Math.floor(diff / 86400)} ي`
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.read).length

  const load = async () => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', table: 'notifications', data: '*' }),
      })
      const json = await res.json()
      if (json.data) setNotifs(json.data.slice(0, 20))
    } catch {}
  }

  useEffect(() => {
    load()
    // تحقق كل دقيقة
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  // إغلاق عند الضغط خارج القائمة
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    const unreadIds = notifs.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    await Promise.all(unreadIds.map(id =>
      fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', table: 'notifications', id, data: { read: true } }),
      })
    ))
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load() }}
        style={{
          position: 'relative',
          width: 34, height: 34,
          border: 'none', background: open ? '#e6f1fb' : 'transparent',
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.12s',
        }}
        title="الإشعارات"
      >
        <svg viewBox="0 0 20 20" fill={open ? '#378ADD' : '#888'} width="18" height="18">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16,
            background: '#ef4444', color: 'white',
            borderRadius: '50%', fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid white',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 42, left: 0,
          width: 300, maxHeight: 400,
          background: 'white', borderRadius: 14,
          border: '1px solid #ebebea',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 100, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: 'slideDown 0.15s ease',
        }}>
          <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>

          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>الإشعارات</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 11, color: '#378ADD', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                قراءة الكل
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#ccc', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                لا توجد إشعارات
              </div>
            ) : notifs.map(n => (
              <div key={n.id} style={{
                padding: '10px 14px',
                borderBottom: '1px solid #f8f8f8',
                background: n.read ? 'transparent' : '#f0f6ff',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type] ?? '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111', lineHeight: 1.4 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 11, color: '#999', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                </div>
                <span style={{ fontSize: 10, color: '#ccc', flexShrink: 0, marginTop: 2 }}>{timeAgo(n.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
