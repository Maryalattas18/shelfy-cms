'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Store, Clock, Eye, Star, Target, Zap, BarChart2,
  Sparkles, Rocket, Smartphone, Users, ClipboardList,
  TrendingUp, Megaphone, Monitor, Award,
  CheckCircle, ArrowLeft, MapPin, MessageCircle, Mail, Menu, X,
} from 'lucide-react'
import { LangProvider, useLang } from '@/lib/LangContext'

/* ─── hooks ───────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function useCountUp(target: number, started: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!started) return
    let n = 0; const step = target / 60
    const t = setInterval(() => {
      n += step
      if (n >= target) { setV(target); clearInterval(t) } else setV(Math.floor(n))
    }, 20)
    return () => clearInterval(t)
  }, [target, started])
  return v
}

function useVisible(ref: React.RefObject<HTMLElement>) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return vis
}

/* ─── Screen Card ────────────────────────────── */
function Screen({ label, active, gradient, children }: { label: string; active: boolean; gradient: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ background: '#0d1117', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ background: '#0a0d12', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22c55e' : '#374151' }} />
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2 }} />
        </div>
        <div style={{ background: gradient, minHeight: 90 }}>{children}</div>
      </div>
      <p style={{ fontSize: 9, color: '#2a3040', textAlign: 'center', margin: 0 }}>{label}</p>
    </div>
  )
}

/* ─── Lang Toggle Button ─────────────────────── */
function LangToggle({ light = false }: { light?: boolean }) {
  const { t, toggle, lang } = useLang()
  return (
    <button
      onClick={toggle}
      style={{
        padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 700,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#8899aa',
        transition: 'all 0.15s',
        letterSpacing: lang === 'ar' ? '0.03em' : 0,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
    >
      {t('lang_btn')}
    </button>
  )
}

/* ─── Navbar ──────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  const { t, dir } = useLang()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navLinks: [string, string][] = [
    [t('nav_about'), '#about'],
    [t('nav_services'), '#services'],
    [t('nav_how'), '#how'],
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, right: 0, left: 0, zIndex: 100,
        background: scrolled || menuOpen ? 'rgba(14,17,23,0.97)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none',
        borderBottom: scrolled || menuOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s', padding: '14px 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'Cairo, sans-serif', direction: dir,
      }}>
        <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 38, objectFit: 'contain', mixBlendMode: 'screen' }} />

        {isMobile ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <LangToggle light />
            <a href="#start" style={{ background: 'linear-gradient(135deg, #378ADD, #185FA5)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 10 }}>
              {t('nav_start_short')}
            </a>
            <button onClick={() => setMenuOpen(m => !m)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} style={{ color: '#bbb', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>{label}</a>
            ))}
            <a href="#start" style={{ background: 'linear-gradient(135deg, #378ADD, #185FA5)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 10, marginInlineStart: 8, boxShadow: '0 2px 12px rgba(55,138,221,0.4)' }}>{t('nav_start')}</a>
            <a href="/portal-login" style={{ color: '#8899aa', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }}>{t('nav_client_login')}</a>
            <LangToggle />
          </div>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: 66, right: 0, left: 0, zIndex: 99, background: 'rgba(14,17,23,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 5%', fontFamily: 'Cairo, sans-serif', direction: dir }}>
          {[...navLinks, [t('nav_client_login'), '/portal-login'] as [string,string]].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: '#ccc', textDecoration: 'none', fontSize: 15, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{label}</a>
          ))}
          <div style={{ paddingTop: 12 }}><LangToggle /></div>
        </div>
      )}
    </>
  )
}

/* ─── Hero ────────────────────────────────────── */
function Hero() {
  const isMobile = useIsMobile()
  const { t, dir } = useLang()
  return (
    <section style={{
      minHeight: '100vh', background: '#0e1117',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: isMobile ? '100px 5% 60px' : '120px 5% 80px',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Cairo, sans-serif', direction: dir,
    }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: isMobile ? 400 : 700, height: isMobile ? 400 : 700, background: 'radial-gradient(circle, rgba(55,138,221,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(55,138,221,0.1)', border: '1px solid rgba(55,138,221,0.22)', borderRadius: 999, padding: '7px 16px', marginBottom: 28, fontSize: isMobile ? 11 : 12, color: '#7ec8f5', fontWeight: 600 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        {isMobile ? t('hero_badge_mobile') : t('hero_badge')}
      </div>

      <h1 style={{ fontSize: isMobile ? 36 : 'clamp(38px, 6.5vw, 76px)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 20, maxWidth: 820, letterSpacing: '-0.025em' }}>
        {t('hero_h1a')}{' '}
        <span style={{ background: 'linear-gradient(135deg, #378ADD, #00c9a7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('hero_h1b')}
        </span>
      </h1>

      <p style={{ fontSize: isMobile ? 15 : 18, color: '#7788a0', lineHeight: 1.9, maxWidth: 560, marginBottom: 40 }}>
        {t('hero_sub')}
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: isMobile ? 320 : 'none' }}>
        <a href="#start" style={{
          background: 'linear-gradient(135deg, #378ADD, #185FA5)', color: 'white', textDecoration: 'none',
          padding: isMobile ? '13px 28px' : '15px 36px', borderRadius: 12, fontSize: isMobile ? 15 : 16, fontWeight: 700,
          boxShadow: '0 4px 28px rgba(55,138,221,0.45)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          width: isMobile ? '100%' : 'auto', justifyContent: 'center',
        }}>
          {t('hero_cta')} <ArrowLeft size={18} />
        </a>
        <a href="#how" style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#ccc', textDecoration: 'none',
          padding: isMobile ? '13px 28px' : '15px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600,
          width: isMobile ? '100%' : 'auto', textAlign: 'center',
        }}>
          {t('hero_how')}
        </a>
      </div>

      <div style={{ marginTop: 60, position: 'relative', maxWidth: isMobile ? 340 : 760, width: '100%' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: isMobile ? '20px 16px 16px' : '28px 28px 20px', boxShadow: '0 40px 100px rgba(0,0,0,0.55)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>{t('hero_active')}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: '#2a3040' }}>Shelfy Network</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: isMobile ? 8 : 14 }}>
            <Screen label={t('s1_label')} active gradient="linear-gradient(160deg, #1a0533 0%, #6d28d9 100%)">
              <div style={{ textAlign: 'center', padding: isMobile ? '16px 6px' : '24px 8px' }}>
                <div style={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={isMobile ? 14 : 20} color="white" />
                </div>
                <div style={{ fontSize: isMobile ? 12 : 15, fontWeight: 800, color: 'white' }}>{t('s1_text')}</div>
                <div style={{ fontSize: isMobile ? 9 : 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{t('s1_sub')}</div>
              </div>
            </Screen>
            <Screen label={t('s2_label')} active gradient="linear-gradient(160deg, #052e16 0%, #16a34a 100%)">
              <div style={{ textAlign: 'center', padding: isMobile ? '16px 6px' : '24px 8px' }}>
                <div style={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={isMobile ? 14 : 20} color="white" />
                </div>
                <div style={{ fontSize: isMobile ? 12 : 15, fontWeight: 800, color: 'white' }}>{t('s2_text')}</div>
                <div style={{ fontSize: isMobile ? 9 : 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{t('s2_sub')}</div>
              </div>
            </Screen>
            <Screen label={t('s3_label')} active gradient="linear-gradient(160deg, #1c1404 0%, #d97706 100%)">
              <div style={{ textAlign: 'center', padding: isMobile ? '16px 6px' : '24px 8px' }}>
                <div style={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={isMobile ? 14 : 20} color="white" />
                </div>
                <div style={{ fontSize: isMobile ? 12 : 15, fontWeight: 800, color: 'white' }}>{t('s3_text')}</div>
                <div style={{ fontSize: isMobile ? 9 : 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{t('s3_sub')}</div>
              </div>
            </Screen>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </section>
  )
}

/* ─── Stats ───────────────────────────────────── */
function Stats() {
  const ref = useRef<HTMLElement>(null!)
  const vis = useVisible(ref)
  const isMobile = useIsMobile()
  const { t, lang } = useLang()
  const s1 = useCountUp(50, vis), s2 = useCountUp(16, vis)
  const s3 = useCountUp(1500000, vis), s4 = useCountUp(98, vis)
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'

  return (
    <section ref={ref} style={{ background: '#f7f8fa', padding: isMobile ? '48px 5%' : '72px 5%', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 12 : 20 }}>
        {[
          { value: s1, suffix: '+', label: t('st1_label'), sub: t('st1_sub'), color: '#378ADD', bg: '#e6f1fb', Icon: Store },
          { value: s2, suffix: '',  label: t('st2_label'), sub: t('st2_sub'), color: '#00c9a7', bg: '#e6fbf7', Icon: Clock },
          { value: s3, suffix: '+', label: t('st3_label'), sub: t('st3_sub'), color: '#f59e0b', bg: '#fef9e6', Icon: Eye   },
          { value: s4, suffix: '%', label: t('st4_label'), sub: t('st4_sub'), color: '#a78bfa', bg: '#f3f0fe', Icon: Star  },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: isMobile ? '20px 16px' : '28px 22px', border: '1px solid #eee', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <s.Icon size={20} color={s.color} strokeWidth={2} />
            </div>
            <div style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {s.value.toLocaleString(locale)}{s.suffix}
            </div>
            <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#111', marginTop: 8 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── About ───────────────────────────────────── */
function About() {
  const isMobile = useIsMobile()
  const { t, dir } = useLang()
  return (
    <section id="about" style={{ background: 'white', padding: isMobile ? '56px 5%' : '88px 5%', fontFamily: 'Cairo, sans-serif', direction: dir }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 64, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>{t('about_badge')}</div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: '#0e1117', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.02em' }}>
            {t('about_h2a')}<br /><span style={{ color: '#378ADD' }}>{t('about_h2b')}</span>
          </h2>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 2, marginBottom: 16 }}>{t('about_p1')}</p>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 2, marginBottom: 28 }}>{t('about_p2')}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {([
              { Icon: Target,    text: t('about_f1'), color: '#378ADD' },
              { Icon: Zap,       text: t('about_f2'), color: '#f59e0b' },
              { Icon: BarChart2, text: t('about_f3'), color: '#00c9a7' },
            ] as { Icon: any; text: string; color: string }[]).map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f7f8fa', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#333', fontWeight: 600, border: '1px solid #ebebea' }}>
                <f.Icon size={15} color={f.color} strokeWidth={2.5} /> {f.text}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {([
            { Icon: Store,    title: t('about_c1'), value: '50+',  color: '#378ADD', bg: '#e6f1fb' },
            { Icon: MapPin,   title: t('about_c2'), value: '8+',   color: '#00c9a7', bg: '#e6fbf7' },
            { Icon: Megaphone,title: t('about_c3'), value: '200+', color: '#f59e0b', bg: '#fef9e6' },
            { Icon: Award,    title: t('about_c4'), value: '24/7', color: '#a78bfa', bg: '#f3f0fe' },
          ] as { Icon: any; title: string; value: string; color: string; bg: string }[]).map(c => (
            <div key={c.title} style={{ background: c.bg, borderRadius: 16, padding: isMobile ? '20px 16px' : '24px 20px', textAlign: 'center', border: `1px solid ${c.color}25` }}>
              <c.Icon size={26} color={c.color} strokeWidth={1.8} style={{ margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: c.color, letterSpacing: '-0.02em' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4, fontWeight: 600 }}>{c.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Services ────────────────────────────────── */
function Services() {
  const isMobile = useIsMobile()
  const { t, dir } = useLang()
  const services = [
    { Icon: Monitor,    title: t('svc1_t'), desc: t('svc1_d'), color: '#378ADD', bg: '#e6f1fb' },
    { Icon: Sparkles,   title: t('svc2_t'), desc: t('svc2_d'), color: '#ec4899', bg: '#fce7f3' },
    { Icon: Target,     title: t('svc3_t'), desc: t('svc3_d'), color: '#00c9a7', bg: '#e6fbf7' },
    { Icon: BarChart2,  title: t('svc4_t'), desc: t('svc4_d'), color: '#f59e0b', bg: '#fef9e6' },
    { Icon: Rocket,     title: t('svc5_t'), desc: t('svc5_d'), color: '#a78bfa', bg: '#f3f0fe' },
    { Icon: Smartphone, title: t('svc6_t'), desc: t('svc6_d'), color: '#22c55e', bg: '#e6fdf0' },
  ]
  return (
    <section id="services" style={{ background: '#f7f8fa', padding: isMobile ? '56px 5%' : '88px 5%', fontFamily: 'Cairo, sans-serif', direction: dir }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>{t('svc_badge')}</div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: '#0e1117', marginBottom: 14, letterSpacing: '-0.02em' }}>{t('svc_h2')}</h2>
          <p style={{ fontSize: 15, color: '#888', maxWidth: 520, margin: '0 auto', lineHeight: 1.9 }}>{t('svc_sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 20 }}>
          {services.map(s => (
            <div key={s.title} style={{ background: 'white', border: '1px solid #eee', borderRadius: 16, padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <s.Icon size={22} color={s.color} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.9 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How it works ────────────────────────────── */
function HowItWorks() {
  const isMobile = useIsMobile()
  const { t, dir } = useLang()
  const steps = [
    { num: '01', title: t('step1_t'), desc: t('step1_d'), Icon: ClipboardList, color: '#378ADD', bg: '#e6f1fb' },
    { num: '02', title: t('step2_t'), desc: t('step2_d'), Icon: Sparkles,     color: '#00c9a7', bg: '#e6fbf7' },
    { num: '03', title: t('step3_t'), desc: t('step3_d'), Icon: TrendingUp,   color: '#a78bfa', bg: '#f3f0fe' },
  ]
  return (
    <section id="how" style={{ background: 'white', padding: isMobile ? '56px 5%' : '88px 5%', fontFamily: 'Cairo, sans-serif', direction: dir }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>{t('how_badge')}</div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: '#0e1117', letterSpacing: '-0.02em' }}>{t('how_h2')}</h2>
          <p style={{ fontSize: 14, color: '#999', marginTop: 10 }}>{t('how_sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24 }}>
          {steps.map(s => (
            <div key={s.num} style={{ textAlign: 'center', display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 0 }}>
              <div style={{ width: isMobile ? 64 : 88, height: isMobile ? 64 : 88, flexShrink: 0, borderRadius: '50%', background: s.bg, border: `2px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: isMobile ? '0' : '0 auto 24px' }}>
                <s.Icon size={isMobile ? 28 : 36} color={s.color} strokeWidth={1.6} />
              </div>
              <div style={{ textAlign: isMobile ? 'start' : 'center' }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 800, marginBottom: 6, letterSpacing: '0.1em' }}>{s.num}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.9, maxWidth: isMobile ? 'none' : 240, margin: isMobile ? '0' : '0 auto' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Lead Form ───────────────────────────────── */
function StartForm() {
  const isMobile = useIsMobile()
  const { t, dir, lang } = useLang()
  const [form, setForm] = useState({ name: '', company: '', phone: '', city: '', notes: '' })
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    const msg = lang === 'ar'
      ? `مرحباً فريق Shelfy\n\nأريد البدء بحملة إعلانية:\n\n• الاسم: ${form.name}\n• الشركة/العلامة: ${form.company}\n• رقم التواصل: ${form.phone}\n• المدينة: ${form.city}\n• تفاصيل إضافية: ${form.notes || 'لا يوجد'}`
      : `Hello Shelfy Team\n\nI'd like to start an ad campaign:\n\n• Name: ${form.name}\n• Company/Brand: ${form.company}\n• Contact: ${form.phone}\n• City: ${form.city}\n• Details: ${form.notes || 'N/A'}`
    window.open(`https://wa.me/966502112743?text=${encodeURIComponent(msg)}`, '_blank')
    setSent(true)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: 'white', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }

  return (
    <section id="start" style={{ background: '#0e1117', padding: isMobile ? '64px 5%' : '96px 5%', fontFamily: 'Cairo, sans-serif', direction: dir }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.2)', color: '#7ec8f5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>{t('form_badge')}</div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: 'white', marginBottom: 12, letterSpacing: '-0.02em' }}>{t('form_h2')}</h2>
          <p style={{ fontSize: 14, color: '#7788a0', lineHeight: 1.9 }}>{t('form_sub')}</p>
        </div>

        {sent ? (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle size={48} color="#4ade80" strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ color: '#4ade80', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t('form_ok_h')}</h3>
            <p style={{ color: '#7788a0', fontSize: 14, lineHeight: 1.8 }}>{t('form_ok_sub')}</p>
            <button onClick={() => setSent(false)} style={{ marginTop: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 14 }}>{t('form_ok_again')}</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: isMobile ? '24px 20px' : '36px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>{t('form_name')} <span style={{ color: '#f43f5e' }}>*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('form_name_ph')} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>{t('form_company')}</label>
                <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder={t('form_company_ph')} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>{t('form_phone')} <span style={{ color: '#f43f5e' }}>*</span></label>
                <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={t('form_phone_ph')} dir="ltr"
                  style={{ ...inputStyle, textAlign: 'left' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>{t('form_city')}</label>
                <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  style={{ ...inputStyle, color: form.city ? 'white' : '#555', cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}>
                  <option value="" style={{ background: '#1a2030' }}>{t('form_city_ph')}</option>
                  {([...T[lang].cities] as string[]).map((c: string) => (
                    <option key={c} value={c} style={{ background: '#1a2030' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>{t('form_notes')}</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder={t('form_notes_ph')}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#378ADD')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #378ADD, #185FA5)', border: 'none', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', boxShadow: '0 4px 20px rgba(55,138,221,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <MessageCircle size={20} /> {t('form_btn')}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 14 }}>{t('form_note')}</p>
          </form>
        )}
      </div>
    </section>
  )
}

/* ─── Client Login ────────────────────────────── */
function ClientLogin() {
  const { t, dir } = useLang()
  return (
    <section id="login" style={{ background: '#080c14', padding: '44px 5%', fontFamily: 'Cairo, sans-serif', direction: dir, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#3a3f50', marginBottom: 14 }}>{t('login_q')}</p>
        <a href="/portal-login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#555', textDecoration: 'none', padding: '11px 24px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
          <Users size={15} /> {t('login_btn')}
        </a>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────── */
function Footer() {
  const isMobile = useIsMobile()
  const { t, dir, lang } = useLang()
  return (
    <footer style={{ background: '#060810', padding: isMobile ? '36px 5% 24px' : '44px 5% 32px', fontFamily: 'Cairo, sans-serif', direction: dir, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: isMobile ? 32 : 48, marginBottom: 28 }}>
          <div>
            <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 36, objectFit: 'contain', marginBottom: 10, mixBlendMode: 'screen' }} />
            <p style={{ fontSize: 13, color: '#2e3340', margin: 0, lineHeight: 1.8 }}>
              {t('footer_tagline').split('\n').map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 32 : 48, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#444', fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: '0.05em' }}>{t('footer_nav')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(T[lang].footer_nav_links as [string,string][]).map(([label, href]) => (
                  <a key={href} href={href} style={{ color: '#333', textDecoration: 'none', fontSize: 13 }}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: '#444', fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: '0.05em' }}>{t('footer_contact')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="https://wa.me/966502112743" target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageCircle size={13} /> {t('footer_wa')}
                </a>
                <a href="mailto:Sshelfyscreens@gmail.com" style={{ color: '#333', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} /> Sshelfyscreens@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 11, color: '#1e2230', margin: 0 }}>© {new Date().getFullYear()} Shelfy Screens. {t('footer_rights')}.</p>
          <Link href="/dashboard" style={{ fontSize: 11, color: '#1a1f2e', textDecoration: 'none' }}>{t('footer_dashboard')}</Link>
        </div>
      </div>
    </footer>
  )
}

// import T for cities
import { T } from '@/lib/lang'

/* ─── Main ────────────────────────────────────── */
export default function LandingPage() {
  return (
    <LangProvider>
      <div style={{ fontFamily: 'Cairo, sans-serif' }}>
        <Navbar />
        <Hero />
        <Stats />
        <About />
        <Services />
        <HowItWorks />
        <StartForm />
        <ClientLogin />
        <Footer />
      </div>
    </LangProvider>
  )
}
