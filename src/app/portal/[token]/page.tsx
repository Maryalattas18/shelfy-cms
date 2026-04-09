'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const STATUS_AR: Record<string, [string, string, string]> = {
  active:    ['#eaf3de', '#27500a', 'نشطة'],
  draft:     ['#e6f1fb', '#0c447c', 'مسودة'],
  paused:    ['#faeeda', '#633806', 'موقوفة'],
  ended:     ['#f1efe8', '#5f5e5a', 'منتهية'],
  scheduled: ['#faeeda', '#633806', 'مجدولة'],
}

export default function ClientPortalPage() {
  const { token } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => { setError('حدث خطأ في الاتصال'); setLoading(false) })
  }, [token])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e6f1fb', borderTop: '3px solid #378ADD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#888', fontSize: 14 }}>جاري التحميل...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: '#fcebeb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20 }}>✕</div>
        <p style={{ color: '#791f1f', fontSize: 15, fontWeight: 600 }}>{error}</p>
        <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>تحقق من الرابط أو تواصل مع Shelfy</p>
      </div>
    </div>
  )

  const { client, stats, campaigns, media } = data

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

      {/* ─── Header ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: '#378ADD', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700 }}>
            S
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Shelfy Screens</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>بوابة العملاء</div>
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{client.company_name}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            {client.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}
          </div>
        </div>
      </div>

      {/* ─── Stats ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'مرات العرض',    value: stats.totalPlays.toLocaleString('ar'),  icon: '▶', color: '#378ADD' },
          { label: 'ساعات التشغيل', value: stats.totalHours.toLocaleString('ar'),  icon: '◷', color: '#7F77DD' },
          { label: 'الحملات',       value: stats.campaignCount,                     icon: '◈', color: '#27a376' },
          { label: 'الإعلانات',     value: stats.mediaCount,                        icon: '▨', color: '#ef9f27' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: 12, padding: '16px 14px' }}>
            <div style={{ width: 32, height: 32, background: s.color + '18', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: 14, marginBottom: 10 }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Campaigns ──────────────────────────── */}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>الحملات الإعلانية</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>{campaigns.length} حملة</span>
        </div>
        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#bbb', fontSize: 13 }}>
            لا توجد حملات بعد
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf8' }}>
                {['الحملة', 'الفترة', 'مرات العرض', 'السعر', 'الحالة'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, color: '#999', fontWeight: 500, borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => {
                const [bg, fg, label] = STATUS_AR[c.status] || ['#f1efe8', '#5f5e5a', c.status]
                return (
                  <tr key={c.id} style={{ borderBottom: '0.5px solid #f5f5f3' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1a1a1a' }}>{c.name}</td>
                    <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>{c.start_date} – {c.end_date}</td>
                    <td style={{ padding: '10px 14px', color: '#1a1a1a', fontWeight: 600 }}>
                      {c.plays > 0 ? c.plays.toLocaleString('ar') : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#1a1a1a' }}>
                      {c.price > 0 ? Number(c.price).toLocaleString('ar') + ' ر' : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: bg, color: fg, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
                        {label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Media ──────────────────────────────── */}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>المحتوى الإعلاني</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>{media.length} ملف</span>
        </div>
        {media.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#bbb', fontSize: 13 }}>
            لا يوجد محتوى بعد
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 16 }}>
            {media.map((m: any) => (
              <div key={m.id} style={{ border: '0.5px solid #e5e5e3', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: 80, background: '#f5f5f3', position: 'relative', overflow: 'hidden' }}>
                  {m.file_type === 'image' && m.file_url ? (
                    <img src={m.file_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{ fontSize: 22 }}>🎬</span>
                      <span style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{m.duration_sec} ث</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <p style={{ fontSize: 11, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                  <p style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                    {m.file_type === 'video' ? `فيديو · ${m.duration_sec} ث` : 'صورة'} · {m.file_size_mb} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Footer ─────────────────────────────── */}
      <div style={{ textAlign: 'center', color: '#ccc', fontSize: 11, paddingBottom: 24 }}>
        <span style={{ color: '#378ADD', fontWeight: 600 }}>Shelfy Screens</span>
        {' · '}نظام إدارة الإعلانات الرقمية
        {' · '}
        {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
      </div>
    </div>
  )
}
