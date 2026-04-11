'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LangProvider, useLang } from '@/lib/LangContext'

/* ─── Status colors ──────────────────────────── */
const STATUS_COLORS: Record<string, [string, string]> = {
  active:    ['#eaf3de', '#27500a'],
  draft:     ['#e6f1fb', '#0c447c'],
  paused:    ['#faeeda', '#633806'],
  ended:     ['#f1efe8', '#5f5e5a'],
  scheduled: ['#faeeda', '#633806'],
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
  const { lang } = useLang()
  const count = useCountUp(value)
  return (
    <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 38, height: 38, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {count.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}{suffix}
      </div>
      <div style={{ fontSize: 12, color: '#999' }}>{label}</div>
    </div>
  )
}

/* ─── Star Rating ─────────────────────────────── */
function StarRating({ campaignId }: { campaignId: string }) {
  const { t, dir } = useLang()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/reviews?campaignId=${campaignId}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.rating) { setExisting(d); setRating(d.rating); setComment(d.comment || ''); setSaved(true) }
      })
  }, [campaignId])

  const submit = async () => {
    if (!rating) return
    setSaving(true)
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: campaignId, rating, comment }) })
    setSaving(false); setSaved(true); setExisting({ rating, comment })
  }

  if (saved && existing) {
    return (
      <div style={{ marginTop: 10, padding: '10px 14px', background: '#f8fdf5', borderRadius: 10, border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 8, direction: dir }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 14, color: i <= existing.rating ? '#f59e0b' : '#e5e7eb' }}>★</span>)}
        </div>
        <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{t('review_thanks')}</span>
        <button onClick={() => setSaved(false)} style={{ marginInlineStart: 'auto', fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}>{t('review_edit')}</button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 10, padding: '12px 14px', background: '#fafaf8', borderRadius: 10, border: '1px solid #ebebea', direction: dir }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{t('review_q')}</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1,2,3,4,5].map(i => (
          <button key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            style={{ fontSize: 24, color: i <= (hover || rating) ? '#f59e0b' : '#e5e7eb', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', transition: 'color 0.1s' }}>★</button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder={t('review_comment_ph')}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <button onClick={submit} disabled={saving} style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #378ADD, #185FA5)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif' }}>
            {saving ? t('review_saving') : t('review_btn')}
          </button>
        </>
      )}
    </div>
  )
}

/* ─── Daily Chart ─────────────────────────────── */
function DailyChart({ data, lang }: { data: { date: string; plays: number }[]; lang: string }) {
  const max = Math.max(...data.map(d => d.plays), 1)
  const days = ['أحد','إث','ثل','أرب','خم','جم','سب']
  const daysEn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const W = 280, H = 80, pad = 20

  return (
    <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>
        {lang === 'ar' ? 'العروض — آخر 7 أيام' : 'Plays — Last 7 Days'}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + pad}`} style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const barW = (W / data.length) * 0.6
          const x = (i / data.length) * W + (W / data.length) * 0.2
          const barH = max > 0 ? (d.plays / max) * H : 0
          const y = H - barH
          const isToday = i === data.length - 1
          const dayIndex = new Date(d.date).getDay()
          const dayLabel = lang === 'ar' ? days[dayIndex] : daysEn[dayIndex]
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 2)}
                rx={4}
                fill={isToday ? '#378ADD' : '#e6f1fb'}
              />
              {d.plays > 0 && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={9} fill="#378ADD" fontWeight={600}>
                  {d.plays}
                </text>
              )}
              <text x={x + barW / 2} y={H + pad - 2} textAnchor="middle" fontSize={9} fill={isToday ? '#378ADD' : '#bbb'} fontWeight={isToday ? 700 : 400}>
                {dayLabel}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

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

/* ─── Main Portal ─────────────────────────────── */
function PortalContent() {
  const { token } = useParams()
  const { t, dir, lang, toggle } = useLang()
  const isMobile = useIsMobile()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [expandedCamp, setExpandedCamp] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else {
          setData(d)
          fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'portal-summary',
              clientName: d.client.company_name,
              activeCampaigns: d.campaigns.filter((c: any) => c.status === 'active').length,
              totalCampaigns: d.stats.campaignCount,
              totalRevenue: d.campaigns.reduce((s: number, c: any) => s + Number(c.price || 0), 0),
              campaigns: d.campaigns,
            }),
          }).then(r => r.json()).then(ai => { if (ai.summary) setAiSummary(ai.summary) })
        }
        setLoading(false)
      })
      .catch(() => { setError('حدث خطأ في الاتصال'); setLoading(false) })
  }, [token])

  const statusLabel = (status: string) => {
    const key = `status_${status}` as any
    return t(key) || status
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8fa', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, border: '3px solid #e6f1fb', borderTop: '3px solid #378ADD', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#aaa', fontSize: 14, fontFamily: 'Cairo, sans-serif' }}>{t('portal_loading')}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, background: '#f7f8fa' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>{error}</p>
        <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>{t('portal_error_sub')}</p>
      </div>
    </div>
  )

  const { client, stats, campaigns, media } = data
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active')
  const whatsappMsg = encodeURIComponent(
    lang === 'ar'
      ? `مرحباً فريق Shelfy،\nأنا ${client.company_name} وأريد الاستفسار عن حملاتي الإعلانية.`
      : `Hello Shelfy Team,\nI'm ${client.company_name} and I'd like to inquire about my ad campaigns.`
  )
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'Cairo, sans-serif', direction: dir }}>

      {/* ─── Top Bar ─── */}
      <div style={{ background: '#0e1117', borderBottom: '1px solid #1e2433', padding: isMobile ? '10px 14px' : '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: isMobile ? 36 : 48, objectFit: 'contain', mixBlendMode: 'screen' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          {/* زر اللغة */}
          <button onClick={toggle} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#aaa' }}>
            {t('lang_btn')}
          </button>
          <a href={`https://wa.me/966502112743?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: 'white', padding: isMobile ? '7px 12px' : '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {!isMobile && t('portal_contact')}
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 16px 48px' }}>

        {/* ─── Welcome ─── */}
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
              {t('portal_welcome')} {client.company_name} 👋
            </div>
            <div style={{ fontSize: 14, color: '#999' }}>{t('portal_welcome_sub')}</div>
          </div>
        </div>

        {/* ─── Stats ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard icon="▶" label={t('portal_plays')}     value={stats.totalPlays}    color="#378ADD" />
          <StatCard icon="⏱" label={t('portal_hours')}     value={stats.totalHours}    color="#7F77DD" suffix={lang === 'ar' ? ' ساعة' : ' hrs'} />
          <StatCard icon="📢" label={t('portal_campaigns')} value={stats.campaignCount} color="#27a376" />
          <StatCard icon="🎬" label={t('portal_media')}     value={stats.mediaCount}    color="#ef9f27" />
        </div>

        {/* ─── Daily Chart ─── */}
        {stats.dailyPlays && stats.dailyPlays.some((d: any) => d.plays > 0) && (
          <DailyChart data={stats.dailyPlays} lang={lang} />
        )}

        {/* ─── AI Summary ─── */}
        {aiSummary && (
          <div style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>✨</div>
            <p style={{ fontSize: 14, color: '#78350f', lineHeight: 1.7, margin: 0 }}>{aiSummary}</p>
          </div>
        )}

        {/* ─── Active Campaigns ─── */}
        {activeCampaigns.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #185FA5, #378ADD)', borderRadius: 16, padding: '18px 22px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>{t('portal_active_now')}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{activeCampaigns.length} {t('portal_active_sub')}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{activeCampaigns.map((c: any) => c.name).join(' · ')}</div>
            </div>
            <div style={{ fontSize: 48, opacity: 0.6 }}>📡</div>
          </div>
        )}

        {/* ─── Campaigns ─── */}
        <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{t('portal_camp_title')}</span>
            <span style={{ fontSize: 12, color: '#bbb', background: '#f5f5f3', padding: '3px 10px', borderRadius: 999 }}>{campaigns.length} {t('portal_camp_unit')}</span>
          </div>
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ccc', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              {t('portal_no_camps')}
            </div>
          ) : (
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {campaigns.map((c: any) => {
                const [bg, fg] = STATUS_COLORS[c.status] || ['#f1efe8', '#5f5e5a']
                const label = statusLabel(c.status)
                const isActive = c.status === 'active'
                const isExpanded = expandedCamp === c.id
                return (
                  <div key={c.id} style={{ border: `1px solid ${isActive ? '#b8e0a0' : '#ebebea'}`, borderRadius: 12, overflow: 'hidden' }}>
                    {/* ─ Header (قابل للضغط) ─ */}
                    <div
                      onClick={() => setExpandedCamp(isExpanded ? null : c.id)}
                      style={{ background: isActive ? '#f8fdf5' : '#fafaf8', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 8 }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{c.name}</span>
                          <span style={{ background: bg, color: fg, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>
                          {c.start_date} — {c.end_date}
                          {c.price > 0 && <span style={{ marginInlineStart: 12, color: '#888' }}>· {Number(c.price).toLocaleString(locale)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {c.plays > 0 && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#378ADD' }}>{c.plays.toLocaleString(locale)}</div>
                            <div style={{ fontSize: 10, color: '#bbb' }}>{t('portal_plays_unit')}</div>
                          </div>
                        )}
                        <span style={{ fontSize: 12, color: '#bbb', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                      </div>
                    </div>

                    {/* ─ التفاصيل ─ */}
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${isActive ? '#c6e8b4' : '#f0f0ee'}`, background: 'white', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* الشاشات */}
                        {c.screens && c.screens.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 8, letterSpacing: '0.05em' }}>{lang === 'ar' ? 'الشاشات المرتبطة' : 'LINKED SCREENS'}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {c.screens.map((s: any) => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fafaf8', borderRadius: 8, border: '1px solid #ebebea' }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'online' ? '#22c55e' : '#e5e7eb', flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{s.name}</div>
                                    {s.location_name && <div style={{ fontSize: 11, color: '#aaa' }}>{s.location_name}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* المحتوى */}
                        {c.media && c.media.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 8, letterSpacing: '0.05em' }}>{lang === 'ar' ? 'المحتوى' : 'CONTENT'} ({c.media.length})</div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8 }}>
                              {c.media.map((m: any) => (
                                <div key={m.id} style={{ border: '1px solid #ebebea', borderRadius: 8, overflow: 'hidden', background: '#fafaf8' }}>
                                  <div style={{ height: 60, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {m.file_type === 'image' && m.file_url
                                      ? <img src={m.file_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      : <span style={{ fontSize: 20 }}>🎬</span>}
                                  </div>
                                  <div style={{ padding: '6px 8px' }}>
                                    <p style={{ fontSize: 10, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {c.status === 'ended' && <div style={{ padding: '0 14px 14px', background: 'white' }}><StarRating campaignId={c.id} /></div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── Media ─── */}
        {media.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{t('portal_media_title')}</span>
              <span style={{ fontSize: 12, color: '#bbb', background: '#f5f5f3', padding: '3px 10px', borderRadius: 999 }}>{media.length} {t('portal_media_unit')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, padding: 12 }}>
              {media.map((m: any) => (
                <div key={m.id} style={{ border: '1px solid #ebebea', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: 80, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {m.file_type === 'image' && m.file_url
                      ? <img src={m.file_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24 }}>🎬</div><div style={{ fontSize: 10, color: '#bbb' }}>{m.duration_sec}s</div></div>
                    }
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ fontSize: 11, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                    <p style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{m.file_type === 'video' ? `${t('vid_label')} · ${m.duration_sec}s` : t('img_label')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CTA ─── */}
        <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>{t('portal_cta_title')}</div>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 18 }}>{t('portal_cta_sub')}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/966502112743?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {t('portal_wa')}
            </a>
            <a href="mailto:Sshelfyscreens@gmail.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f5f5f3', color: '#444', border: '1px solid #e5e5e3', padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              📧 {t('portal_email')}
            </a>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#ccc', fontSize: 11 }}>
          <span style={{ color: '#378ADD', fontWeight: 700 }}>Shelfy Screens</span>
          {' · '}{t('portal_footer')}
          {' · '}
          {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long' })}
        </div>
      </div>
    </div>
  )
}

export default function ClientPortalPage() {
  return (
    <LangProvider>
      <PortalContent />
    </LangProvider>
  )
}
