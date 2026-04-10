'use client'
import { useState, useEffect } from 'react'
import { getClients, getCampaigns, getScreens } from '@/lib/supabase'
import Link from 'next/link'

const STATUS: Record<string, [string, string, string]> = {
  active:    ['#dcfce7', '#15803d', 'نشطة'],
  scheduled: ['#fef9c3', '#a16207', 'مجدولة'],
  draft:     ['#dbeafe', '#1d4ed8', 'مسودة'],
  ended:     ['#f3f4f6', '#4b5563', 'منتهية'],
  online:    ['#dcfce7', '#15803d', 'متصلة'],
  offline:   ['#fee2e2', '#dc2626', 'غير متصلة'],
  idle:      ['#fef9c3', '#a16207', 'خاملة'],
}

const STAT_CARDS = [
  {
    key: 'screens',
    label: 'الشاشات النشطة',
    sub: 'شاشة متصلة',
    color: '#378ADD',
    bg: '#e6f1fb',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    key: 'campaigns',
    label: 'الحملات الجارية',
    sub: 'حملة نشطة',
    color: '#7F77DD',
    bg: '#ede9fe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    key: 'clients',
    label: 'العملاء',
    sub: 'عميل مسجّل',
    color: '#27a376',
    bg: '#dcfce7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    key: 'plays',
    label: 'عروض هذا الشهر',
    sub: 'مرة عرض',
    color: '#ef9f27',
    bg: '#fef3c7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
]

function useIsMobile() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const check = () => setV(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return v
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [screens, setScreens] = useState<any[]>([])
  const [stats, setStats] = useState({ screens: { total: 0, online: 0 }, campaigns: { active: 0 }, clients: { total: 0 }, monthlyPlays: 0 })
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور'
  const dateStr = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    fetch('/api/check-campaigns').catch(() => {})
    const load = async () => {
      const [c, s, cl, dashStats] = await Promise.all([
        getCampaigns(),
        getScreens(),
        getClients(),
        fetch('/api/stats?type=dashboard').then(r => r.json()).catch(() => ({})),
      ])
      const camps = c as any[]
      const scrns = s as any[]
      const clients = cl as any[]
      setCampaigns(camps.slice(0, 5))
      setScreens(scrns.slice(0, 5))
      setStats({
        screens: { total: scrns.length, online: scrns.filter((s: any) => s.status === 'online').length },
        campaigns: { active: camps.filter((c: any) => c.status === 'active').length },
        clients: { total: clients.length },
        monthlyPlays: dashStats.monthlyPlays || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const statValues: Record<string, string | number> = {
    screens: `${stats.screens.online}/${stats.screens.total}`,
    campaigns: stats.campaigns.active,
    clients: stats.clients.total,
    plays: stats.monthlyPlays.toLocaleString('ar-SA'),
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e6f1fb', borderTop: '3px solid #378ADD', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 3 }}>
            {greeting} 👋
          </h1>
          <p style={{ fontSize: 13, color: '#aaa' }}>{dateStr}</p>
        </div>
        <Link href="/campaigns/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          background: 'linear-gradient(135deg, #378ADD, #185FA5)',
          color: 'white', textDecoration: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 700,
          boxShadow: '0 3px 10px rgba(55,138,221,0.3)',
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
          حملة جديدة
        </Link>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {STAT_CARDS.map(card => (
          <div key={card.key} style={{
            background: 'white',
            border: '1px solid #ebebea',
            borderRadius: 16,
            padding: '18px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.15s, transform 0.15s',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
          >
            {/* خلفية دائرة ديكور */}
            <div style={{
              position: 'absolute', top: -12, left: -12,
              width: 70, height: 70, borderRadius: '50%',
              background: card.bg, opacity: 0.6,
            }} />
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: card.color, marginBottom: 12, position: 'relative',
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#111', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
              {statValues[card.key]}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 1 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Tables ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>

        {/* آخر الحملات */}
        <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7F77DD' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>آخر الحملات</span>
            </div>
            <Link href="/campaigns" style={{ fontSize: 12, color: '#378ADD', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf8' }}>
                {['الحملة', 'العميل', 'الحالة'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#bbb', borderBottom: '1px solid #f0f0ee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px 16px', color: '#ccc', fontSize: 13 }}>لا توجد حملات بعد</td></tr>
              ) : campaigns.map((c: any) => {
                const [bg, fg, label] = STATUS[c.status] || ['#f3f4f6', '#4b5563', c.status]
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f3', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111' }}>{c.name}</td>
                    <td style={{ padding: '11px 14px', color: '#888', fontSize: 12 }}>{c.client?.company_name || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* حالة الشاشات */}
        <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27a376' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>حالة الشاشات</span>
            </div>
            <Link href="/screens" style={{ fontSize: 12, color: '#378ADD', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf8' }}>
                {['الشاشة', 'الموقع', 'الحالة'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#bbb', borderBottom: '1px solid #f0f0ee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {screens.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px 16px', color: '#ccc', fontSize: 13 }}>لا توجد شاشات بعد</td></tr>
              ) : screens.map((s: any) => {
                const [bg, fg, label] = STATUS[s.status] || ['#f3f4f6', '#4b5563', s.status]
                const dotColor = s.status === 'online' ? '#22c55e' : s.status === 'offline' ? '#ef4444' : '#f59e0b'
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f3', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0,
                          boxShadow: s.status === 'online' ? '0 0 0 3px rgba(34,197,94,0.2)' : s.status === 'idle' ? '0 0 0 3px rgba(245,158,11,0.2)' : 'none',
                        }} />
                        <span style={{ fontWeight: 600, color: '#111' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#888', fontSize: 12 }}>{s.location?.name || s.location_name || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
