'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LangProvider, useLang } from '@/lib/LangContext'

/* ─── Tokens ──────────────────────────────────── */
const C = {
  bg:        '#060d1a',
  bgCard:    'rgba(255,255,255,0.04)',
  bgCardHov: 'rgba(255,255,255,0.07)',
  border:    'rgba(255,255,255,0.08)',
  borderAcc: 'rgba(59,158,255,0.35)',
  accent:    '#3b9eff',
  accentSoft:'rgba(59,158,255,0.12)',
  accentGlow:'rgba(59,158,255,0.25)',
  cyan:      '#00d4ff',
  purple:    '#a78bfa',
  green:     '#34d399',
  amber:     '#fbbf24',
  textPri:   '#e8f0ff',
  textSec:   'rgba(232,240,255,0.5)',
  textMut:   'rgba(232,240,255,0.28)',
}

const STATUS_COLORS: Record<string, [string, string]> = {
  active:    ['rgba(52,211,153,0.12)', '#34d399'],
  draft:     ['rgba(59,158,255,0.12)', '#3b9eff'],
  paused:    ['rgba(251,191,36,0.12)', '#fbbf24'],
  ended:     ['rgba(255,255,255,0.07)', 'rgba(232,240,255,0.45)'],
  scheduled: ['rgba(167,139,250,0.12)', '#a78bfa'],
}

/* ─── Helpers ─────────────────────────────────── */
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

/* ─── Stat Card ───────────────────────────────── */
function StatCard({ icon, label, value, color, suffix = '' }: {
  icon: string; label: string; value: number; color: string; suffix?: string
}) {
  const { lang } = useLang()
  const count = useCountUp(value)
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = color + '55'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${color}18`
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = C.border
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
    }}>
      {/* top-right glow dot */}
      <div style={{ position: 'absolute', top: -20, insetInlineEnd: -20, width: 70, height: 70, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(20px)' }} />
      <div style={{ width: 36, height: 36, background: color + '18', border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: C.textPri, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {count.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}{suffix}
      </div>
      <div style={{ fontSize: 11, color: C.textMut, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
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

  if (saved && existing) return (
    <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(52,211,153,0.07)', borderRadius: 10, border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', gap: 8, direction: dir }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 14, color: i <= existing.rating ? C.amber : C.border }}>★</span>)}
      </div>
      <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{t('review_thanks')}</span>
      <button onClick={() => setSaved(false)} style={{ marginInlineStart: 'auto', fontSize: 11, color: C.textMut, background: 'none', border: 'none', cursor: 'pointer' }}>{t('review_edit')}</button>
    </div>
  )

  return (
    <div style={{ marginTop: 10, padding: '12px 14px', background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}`, direction: dir }}>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 8 }}>{t('review_q')}</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1,2,3,4,5].map(i => (
          <button key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            style={{ fontSize: 24, color: i <= (hover || rating) ? C.amber : C.border, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', transition: 'color 0.1s' }}>★</button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder={t('review_comment_ph')}
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: 8, color: C.textPri }} />
          <button onClick={submit} disabled={saving}
            style={{ padding: '8px 20px', background: `linear-gradient(135deg, ${C.accent}, #185FA5)`, border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', boxShadow: `0 4px 14px ${C.accentGlow}` }}>
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
  const days    = ['أحد','إث','ثل','أرب','خم','جم','سب']
  const daysEn  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const W = 300, H = 90, pad = 22

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMut, marginBottom: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {lang === 'ar' ? 'العروض — آخر 7 أيام' : 'Plays — Last 7 Days'}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + pad}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} />
            <stop offset="100%" stopColor={C.cyan} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barW = (W / data.length) * 0.55
          const x = (i / data.length) * W + (W / data.length) * 0.225
          const barH = max > 0 ? (d.plays / max) * H : 0
          const y = H - barH
          const isToday = i === data.length - 1
          const dayIndex = new Date(d.date).getDay()
          const dayLabel = lang === 'ar' ? days[dayIndex] : daysEn[dayIndex]
          return (
            <g key={d.date}>
              {/* base track */}
              <rect x={x} y={0} width={barW} height={H} rx={4} fill={C.bgCard} />
              {/* value bar */}
              <rect x={x} y={y} width={barW} height={Math.max(barH, 3)} rx={4}
                fill={isToday ? 'url(#barGrad)' : 'rgba(59,158,255,0.2)'}
              />
              {isToday && barH > 0 && (
                <rect x={x} y={y} width={barW} height={3} rx={2} fill={C.accent}
                  style={{ filter: `drop-shadow(0 0 4px ${C.accent})` }} />
              )}
              {d.plays > 0 && (
                <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={8} fill={isToday ? C.accent : C.textMut} fontWeight={700}>
                  {d.plays}
                </text>
              )}
              <text x={x + barW / 2} y={H + pad - 2} textAnchor="middle" fontSize={9}
                fill={isToday ? C.accent : C.textMut} fontWeight={isToday ? 700 : 400}>
                {dayLabel}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
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

  /* Loading */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.bg, flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(40px)} }
      `}</style>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, border: `2px solid ${C.accentSoft}`, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: `2px solid transparent`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 8, border: `1px solid ${C.accentSoft}`, borderRadius: '50%', borderTopColor: C.cyan, animation: 'spin 1.4s linear infinite reverse' }} />
      </div>
      <p style={{ color: C.textMut, fontSize: 13, fontFamily: 'Cairo, sans-serif', animation: 'pulse 1.6s ease-in-out infinite' }}>{t('portal_loading')}</p>
    </div>
  )

  /* Error */
  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, background: C.bg }}>
      <div style={{ textAlign: 'center', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>⚠</div>
        <p style={{ color: C.textPri, fontSize: 16, fontWeight: 600 }}>{error}</p>
        <p style={{ color: C.textMut, fontSize: 13, marginTop: 8 }}>{t('portal_error_sub')}</p>
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
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Cairo, sans-serif', direction: dir, position: 'relative' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px rgba(52,211,153,0.4)} 50%{box-shadow:0 0 16px rgba(52,211,153,0.7)} }
        .shelfy-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .shelfy-card:hover { transform: translateY(-1px); }
        body { background: ${C.bg}; }
      `}</style>

      {/* ── Background grid ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(rgba(59,158,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,158,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '40px 40px' }} />
      {/* Radial glow top-center */}
      <div style={{ position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,158,255,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ─── Top Bar ─── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, padding: isMobile ? '10px 16px' : '10px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: isMobile ? 34 : 44, objectFit: 'contain', mixBlendMode: 'screen' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          <button onClick={toggle}
            style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 700, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textSec, backdropFilter: 'blur(8px)', transition: 'border-color 0.2s' }}>
            {t('lang_btn')}
          </button>
          <a href={`https://wa.me/966502112743?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #25D366, #1aad52)', color: 'white', padding: isMobile ? '7px 12px' : '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 12px rgba(37,211,102,0.35)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {!isMobile && t('portal_contact')}
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: isMobile ? '24px 14px 60px' : '36px 24px 80px', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease-out' }}>

        {/* ─── Welcome ─── */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 18 }}>
          {client.logo_url ? (
            <div style={{ width: 60, height: 60, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.borderAcc}`, boxShadow: `0 0 20px ${C.accentGlow}`, flexShrink: 0 }}>
              <img src={client.logo_url} alt={client.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent}, #185FA5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 900, boxShadow: `0 0 24px ${C.accentGlow}`, flexShrink: 0 }}>
              {client.company_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: C.textPri, marginBottom: 4, letterSpacing: '-0.02em' }}>
              {t('portal_welcome')} {client.company_name}
            </div>
            <div style={{ fontSize: 13, color: C.textMut }}>{t('portal_welcome_sub')}</div>
          </div>
        </div>

        {/* ─── Stats ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard icon="▶" label={t('portal_plays')}     value={stats.totalPlays}    color={C.accent} />
          <StatCard icon="⏱" label={t('portal_hours')}     value={stats.totalHours}    color={C.purple} suffix={lang === 'ar' ? ' ساعة' : ' hrs'} />
          <StatCard icon="📢" label={t('portal_campaigns')} value={stats.campaignCount} color={C.green} />
          <StatCard icon="🎬" label={t('portal_media')}     value={stats.mediaCount}    color={C.amber} />
        </div>

        {/* ─── Daily Chart ─── */}
        {stats.dailyPlays && stats.dailyPlays.some((d: any) => d.plays > 0) && (
          <DailyChart data={stats.dailyPlays} lang={lang} />
        )}

        {/* ─── AI Summary ─── */}
        {aiSummary && (
          <div style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(59,158,255,0.06))', border: `1px solid rgba(167,139,250,0.2)`, borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✨</div>
            <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8, margin: 0 }}>{aiSummary}</p>
          </div>
        )}

        {/* ─── Active Campaigns Banner ─── */}
        {activeCampaigns.length > 0 && (
          <div style={{ position: 'relative', borderRadius: 18, padding: '20px 24px', marginBottom: 20, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(59,158,255,0.06))', border: `1px solid rgba(52,211,153,0.25)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'glow 3s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', insetInlineEnd: 0, top: 0, bottom: 0, width: 200, background: 'radial-gradient(ellipse at center, rgba(52,211,153,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                <div style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('portal_active_now')}</div>
              </div>
              <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: C.textPri, letterSpacing: '-0.02em' }}>
                {activeCampaigns.length} {t('portal_active_sub')}
              </div>
              <div style={{ fontSize: 12, color: C.textMut, marginTop: 4 }}>{activeCampaigns.map((c: any) => c.name).join(' · ')}</div>
            </div>
            <div style={{ fontSize: isMobile ? 36 : 48, opacity: 0.5 }}>📡</div>
          </div>
        )}

        {/* ─── Campaigns ─── */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textPri, letterSpacing: '0.02em' }}>{t('portal_camp_title')}</span>
            <span style={{ fontSize: 11, color: C.textMut, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, padding: '3px 12px', borderRadius: 999 }}>{campaigns.length} {t('portal_camp_unit')}</span>
          </div>
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: C.textMut, fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📋</div>
              {t('portal_no_camps')}
            </div>
          ) : (
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {campaigns.map((c: any) => {
                const [bg, fg] = STATUS_COLORS[c.status] || [C.bgCard, C.textMut]
                const label = statusLabel(c.status)
                const isActive = c.status === 'active'
                const isExpanded = expandedCamp === c.id
                return (
                  <div key={c.id} className="shelfy-card"
                    style={{ border: `1px solid ${isActive ? 'rgba(52,211,153,0.25)' : C.border}`, borderRadius: 14, overflow: 'hidden', background: isActive ? 'rgba(52,211,153,0.04)' : 'transparent' }}>
                    {/* Header */}
                    <div onClick={() => setExpandedCamp(isExpanded ? null : c.id)}
                      style={{ padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, flexShrink: 0 }} />}
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>{c.name}</span>
                          <span style={{ background: bg, color: fg, padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>{label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.textMut }}>
                          {c.start_date} — {c.end_date}
                          {c.price > 0 && <span style={{ marginInlineStart: 12, color: C.textSec }}>· {Number(c.price).toLocaleString(locale)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {c.plays > 0 && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>{c.plays.toLocaleString(locale)}</div>
                            <div style={{ fontSize: 9, color: C.textMut, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t('portal_plays_unit')}</div>
                          </div>
                        )}
                        <span style={{ fontSize: 10, color: C.textMut, transition: 'transform 0.25s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Screens */}
                        {c.screens && c.screens.length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lang === 'ar' ? 'الشاشات المرتبطة' : 'LINKED SCREENS'}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {c.screens.map((s: any) => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}` }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.status === 'online' ? C.green : C.border, boxShadow: s.status === 'online' ? `0 0 8px ${C.green}` : 'none' }} />
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{s.name}</div>
                                    {s.location_name && <div style={{ fontSize: 11, color: C.textMut }}>{s.location_name}</div>}
                                  </div>
                                  {s.status === 'online' && <div style={{ marginInlineStart: 'auto', fontSize: 10, color: C.green, fontWeight: 700 }}>LIVE</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Media */}
                        {c.media && c.media.length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lang === 'ar' ? 'المحتوى' : 'CONTENT'} ({c.media.length})</div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8 }}>
                              {c.media.map((m: any) => (
                                <div key={m.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', background: C.bgCard }}>
                                  <div style={{ height: 64, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {m.file_type === 'image' && m.file_url
                                      ? <img src={m.file_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, opacity: 0.5 }}>🎬</div></div>}
                                  </div>
                                  <div style={{ padding: '7px 10px' }}>
                                    <p style={{ fontSize: 10, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {c.status === 'ended' && <div style={{ padding: '0 16px 14px', background: 'rgba(255,255,255,0.02)' }}><StarRating campaignId={c.id} /></div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── Media ─── */}
        {media.length > 0 && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 28, backdropFilter: 'blur(12px)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{t('portal_media_title')}</span>
              <span style={{ fontSize: 11, color: C.textMut, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, padding: '3px 12px', borderRadius: 999 }}>{media.length} {t('portal_media_unit')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, padding: 14 }}>
              {media.map((m: any) => (
                <div key={m.id} className="shelfy-card" style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', background: C.bgCard }}>
                  <div style={{ height: 80, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {m.file_type === 'image' && m.file_url
                      ? <img src={m.file_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, opacity: 0.4 }}>🎬</div><div style={{ fontSize: 10, color: C.textMut }}>{m.duration_sec}s</div></div>
                    }
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ fontSize: 11, color: C.textSec, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                    <p style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{m.file_type === 'video' ? `${t('vid_label')} · ${m.duration_sec}s` : t('img_label')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CTA ─── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,158,255,0.06), rgba(167,139,250,0.05))', border: `1px solid ${C.borderAcc}`, borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.textPri, marginBottom: 6 }}>{t('portal_cta_title')}</div>
          <div style={{ fontSize: 13, color: C.textMut, marginBottom: 22 }}>{t('portal_cta_sub')}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/966502112743?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #25D366, #1aad52)', color: 'white', padding: '11px 24px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {t('portal_wa')}
            </a>
            <a href="mailto:Sshelfyscreens@gmail.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.bgCard, color: C.textSec, border: `1px solid ${C.border}`, padding: '11px 24px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              📧 {t('portal_email')}
            </a>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{ textAlign: 'center', marginTop: 40, color: C.textMut, fontSize: 11, letterSpacing: '0.04em' }}>
          <span style={{ color: C.accent, fontWeight: 700 }}>Shelfy Screens</span>
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
