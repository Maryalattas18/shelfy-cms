'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

const STATUS_AR: Record<string, [string, string, string]> = {
  active:    ['#eaf3de', '#27500a', 'نشطة'],
  draft:     ['#e6f1fb', '#0c447c', 'مسودة'],
  paused:    ['#faeeda', '#633806', 'موقوفة'],
  ended:     ['#f1efe8', '#5f5e5a', 'منتهية'],
  scheduled: ['#faeeda', '#633806', 'مجدولة'],
}

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function StatCard({ icon, label, value, color, suffix = '' }: { icon: string; label: string; value: number; color: string; suffix?: string }) {
  const count = useCountUp(value)
  return (
    <div style={{
      background: 'white',
      border: '1px solid #ebebea',
      borderRadius: 16,
      padding: '20px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 38, height: 38,
        background: color + '18',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {count.toLocaleString('ar-SA')}{suffix}
      </div>
      <div style={{ fontSize: 12, color: '#999' }}>{label}</div>
    </div>
  )
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8fa' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e6f1fb', borderTop: '3px solid #378ADD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#aaa', fontSize: 14, fontFamily: 'Cairo, sans-serif' }}>جاري تحميل تقريرك...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, background: '#f7f8fa' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>{error}</p>
        <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>تحقق من الرابط أو تواصل مع فريق Shelfy</p>
      </div>
    </div>
  )

  const { client, stats, campaigns, media } = data
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active')
  const whatsappMsg = encodeURIComponent(`مرحباً فريق Shelfy،\nأنا ${client.company_name} وأريد الاستفسار عن حملاتي الإعلانية.`)

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>

      {/* ─── Top Bar ─────────────────────────────────── */}
      <div style={{ background: '#0e1117', borderBottom: '1px solid #1e2433', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 48, objectFit: 'contain' }} />
        </div>
        <a
          href={`https://wa.me/966XXXXXXXXX?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#25D366', color: 'white',
            padding: '8px 16px', borderRadius: 999,
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
          }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          تواصل معنا
        </a>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 16px 48px' }}>

        {/* ─── Welcome ──────────────────────────────── */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          {client.logo_url ? (
            <img src={client.logo_url} alt={client.company_name} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '1px solid #ebebea', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #378ADD, #185FA5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800, boxShadow: '0 2px 8px rgba(55,138,221,0.25)' }}>
              {client.company_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 2 }}>
              أهلاً، {client.company_name} 👋
            </div>
            <div style={{ fontSize: 14, color: '#999' }}>
              إليك ملخص أداء حملاتك الإعلانية على شبكة شاشات Shelfy
            </div>
          </div>
        </div>

        {/* ─── Stats ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          <StatCard icon="▶" label="إجمالي مرات العرض"   value={stats.totalPlays}     color="#378ADD" />
          <StatCard icon="⏱" label="ساعات البث الفعلية"  value={stats.totalHours}     color="#7F77DD" suffix=" ساعة" />
          <StatCard icon="📢" label="الحملات الإعلانية"   value={stats.campaignCount}  color="#27a376" />
          <StatCard icon="🎬" label="مقاطع إعلانية"       value={stats.mediaCount}     color="#ef9f27" />
        </div>

        {/* ─── Active campaigns highlight ───────────── */}
        {activeCampaigns.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #185FA5, #378ADD)',
            borderRadius: 16, padding: '18px 22px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: 'white',
          }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>الحملات النشطة الآن</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{activeCampaigns.length} حملة تعرض إعلاناتك</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                {activeCampaigns.map((c: any) => c.name).join(' · ')}
              </div>
            </div>
            <div style={{ fontSize: 48, opacity: 0.6 }}>📡</div>
          </div>
        )}

        {/* ─── Campaigns ────────────────────────────── */}
        <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>الحملات الإعلانية</span>
            <span style={{ fontSize: 12, color: '#bbb', background: '#f5f5f3', padding: '3px 10px', borderRadius: 999 }}>{campaigns.length} حملة</span>
          </div>
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ccc', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              لا توجد حملات بعد
            </div>
          ) : (
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {campaigns.map((c: any) => {
                const [bg, fg, label] = STATUS_AR[c.status] || ['#f1efe8', '#5f5e5a', c.status]
                const isActive = c.status === 'active'
                return (
                  <div key={c.id} style={{
                    border: `1px solid ${isActive ? '#b8e0a0' : '#ebebea'}`,
                    background: isActive ? '#f8fdf5' : '#fafaf8',
                    borderRadius: 12, padding: '14px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{c.name}</span>
                        <span style={{ background: bg, color: fg, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>
                        {c.start_date} — {c.end_date}
                        {c.price > 0 && <span style={{ marginRight: 12, color: '#888' }}>· {Number(c.price).toLocaleString('ar-SA')} ر.س</span>}
                      </div>
                    </div>
                    {c.plays > 0 && (
                      <div style={{ textAlign: 'center', marginRight: 16 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#378ADD' }}>{c.plays.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: 10, color: '#bbb' }}>مرة عرض</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── Media ────────────────────────────────── */}
        {media.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>المحتوى الإعلاني</span>
              <span style={{ fontSize: 12, color: '#bbb', background: '#f5f5f3', padding: '3px 10px', borderRadius: 999 }}>{media.length} ملف</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 14 }}>
              {media.map((m: any) => (
                <div key={m.id} style={{ border: '1px solid #ebebea', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: 80, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {m.file_type === 'image' && m.file_url
                      ? <img src={m.file_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24 }}>🎬</div><div style={{ fontSize: 10, color: '#bbb' }}>{m.duration_sec}ث</div></div>
                    }
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ fontSize: 11, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                    <p style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{m.file_type === 'video' ? `فيديو · ${m.duration_sec}ث` : 'صورة'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Contact CTA ──────────────────────────── */}
        <div style={{
          background: 'white', border: '1px solid #ebebea',
          borderRadius: 16, padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>هل تريد تطوير حملاتك؟</div>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 18 }}>فريق Shelfy مستعد لمساعدتك في تصميم حملات أكثر تأثيراً</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/966XXXXXXXXX?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#25D366', color: 'white',
                padding: '10px 22px', borderRadius: 999,
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              واتساب
            </a>
            <a
              href="mailto:hello@shelfyscreens.com"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#f5f5f3', color: '#444',
                border: '1px solid #e5e5e3',
                padding: '10px 22px', borderRadius: 999,
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
              📧 البريد الإلكتروني
            </a>
          </div>
        </div>

        {/* ─── Footer ───────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#ccc', fontSize: 11 }}>
          <span style={{ color: '#378ADD', fontWeight: 700 }}>Shelfy Screens</span>
          {' · '}شبكة الإعلانات الرقمية
          {' · '}
          {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
        </div>

      </div>
    </div>
  )
}
