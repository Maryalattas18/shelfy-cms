'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Store, Clock, Eye, Star, Target, Zap, BarChart2,
  Sparkles, Rocket, Smartphone, Users, ClipboardList,
  TrendingUp, Megaphone, Monitor, Globe, Award,
  CheckCircle, ArrowLeft, MapPin, MessageCircle, Mail,
} from 'lucide-react'

/* ─── count-up hook ───────────────────────────── */
function useCountUp(target: number, started: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!started) return
    let n = 0
    const step = target / 60
    const t = setInterval(() => {
      n += step
      if (n >= target) { setV(target); clearInterval(t) }
      else setV(Math.floor(n))
    }, 20)
    return () => clearInterval(t)
  }, [target, started])
  return v
}

function useVisible(ref: React.RefObject<HTMLElement>) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return vis
}

/* ─── Screen Card ────────────────────────────── */
function Screen({ label, active, gradient, children }: { label: string; active: boolean; gradient: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* إطار الشاشة */}
      <div style={{
        background: '#0d1117',
        border: '2px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* شريط علوي */}
        <div style={{ background: '#0a0d12', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22c55e' : '#374151' }} />
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2 }} />
        </div>
        {/* محتوى الشاشة */}
        <div style={{ background: gradient, minHeight: 90 }}>
          {children}
        </div>
      </div>
      {/* تسمية */}
      <p style={{ fontSize: 9, color: '#2a3040', textAlign: 'center', margin: 0 }}>{label}</p>
    </div>
  )
}

/* ─── Navbar ──────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, right: 0, left: 0, zIndex: 100,
      background: scrolled ? 'rgba(14,17,23,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s',
      padding: '14px 5%',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'Cairo, sans-serif', direction: 'rtl',
    }}>
      <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 40, objectFit: 'contain' }} />
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[['من نحن','#about'],['الخدمات','#services'],['كيف يعمل','#how']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: '#bbb', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>{label}</a>
        ))}
        <a href="#start" style={{
          background: 'linear-gradient(135deg, #378ADD, #185FA5)',
          color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700,
          padding: '9px 20px', borderRadius: 10, marginRight: 8,
          boxShadow: '0 2px 12px rgba(55,138,221,0.4)',
        }}>ابدأ حملتك</a>
        <a href="/portal-login" style={{ color: '#666', textDecoration: 'none', fontSize: 13, padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          دخول العملاء
        </a>
      </div>
    </nav>
  )
}

/* ─── Hero ────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      minHeight: '100vh', background: '#0e1117',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '120px 5% 80px',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Cairo, sans-serif', direction: 'rtl',
    }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(55,138,221,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,201,167,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(55,138,221,0.1)', border: '1px solid rgba(55,138,221,0.22)',
        borderRadius: 999, padding: '7px 18px', marginBottom: 32,
        fontSize: 12, color: '#7ec8f5', fontWeight: 600,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        الشبكة الإعلانية الرقمية الأولى داخل الميني ماركت في المملكة
      </div>

      <h1 style={{
        fontSize: 'clamp(38px, 6.5vw, 76px)', fontWeight: 900,
        color: 'white', lineHeight: 1.1, marginBottom: 24, maxWidth: 820,
        letterSpacing: '-0.025em',
      }}>
        وصّل إعلانك لكل{' '}
        <span style={{ background: 'linear-gradient(135deg, #378ADD, #00c9a7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          عميل في السعودية
        </span>
      </h1>

      <p style={{ fontSize: 18, color: '#7788a0', lineHeight: 1.9, maxWidth: 560, marginBottom: 44 }}>
        شاشاتنا الرقمية داخل الميني ماركت تضع إعلانك أمام المستهلك في لحظة القرار — في المكان الصحيح، في الوقت الصحيح
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="#start" style={{
          background: 'linear-gradient(135deg, #378ADD, #185FA5)',
          color: 'white', textDecoration: 'none',
          padding: '15px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700,
          boxShadow: '0 4px 28px rgba(55,138,221,0.45)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 36px rgba(55,138,221,0.55)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 28px rgba(55,138,221,0.45)' }}
        >
          ابدأ حملتك الإعلانية
          <ArrowLeft size={18} />
        </a>
        <a href="#how" style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#ccc', textDecoration: 'none',
          padding: '15px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = '#ccc' }}
        >
          كيف يعمل النظام؟
        </a>
      </div>

      {/* Screens Mockup */}
      <div style={{ marginTop: 70, position: 'relative', maxWidth: 760, width: '100%' }}>

        {/* شريط الرف */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, padding: '28px 28px 20px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.55)',
        }}>

          {/* تسمية */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>شاشات نشطة الآن</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: '#2a3040' }}>Shelfy Network</span>
          </div>

          {/* شبكة الشاشات */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

            {/* شاشة 1 - إعلان كبير */}
            <div style={{ gridColumn: 'span 2' }}>
              <Screen
                label="ميني ماركت الرياض — شاشة الرف الأمامي"
                active
                gradient="linear-gradient(135deg, #185FA5 0%, #378ADD 50%, #00c9a7 100%)"
              >
                <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>إعلانك</div>
                  <div style={{ marginTop: 12, display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '5px 16px', fontSize: 11, color: 'white', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Shelfy Screens
                  </div>
                </div>
              </Screen>
            </div>

            {/* شاشة 2 */}
            <div>
              <Screen
                label="شاشة منطقة الدفع"
                active
                gradient="linear-gradient(160deg, #1a0533 0%, #6d28d9 100%)"
              >
                <div style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Monitor size={18} color="white" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>إعلانك</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>عند الدفع</div>
                </div>
              </Screen>
            </div>

            {/* شاشة 3 */}
            <div>
              <Screen
                label="شاشة رف المنتجات"
                active
                gradient="linear-gradient(160deg, #052e16 0%, #16a34a 100%)"
              >
                <div style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={18} color="white" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>استهداف</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>دقيق</div>
                </div>
              </Screen>
            </div>

            {/* شاشة 4 */}
            <div>
              <Screen
                label="شاشة المدخل"
                active
                gradient="linear-gradient(160deg, #1c1404 0%, #d97706 100%)"
              >
                <div style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} color="white" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>نمو</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>مستمر</div>
                </div>
              </Screen>
            </div>

          </div>


        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </section>
  )
}

/* ─── Stats ───────────────────────────────────── */
function Stats() {
  const ref = useRef<HTMLElement>(null!)
  const vis = useVisible(ref)
  const s1 = useCountUp(50, vis)
  const s2 = useCountUp(16, vis)
  const s3 = useCountUp(1500000, vis)
  const s4 = useCountUp(98, vis)

  return (
    <section ref={ref} style={{ background: '#f7f8fa', padding: '72px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        {[
          { value: s1, suffix: '+', label: 'ميني ماركت',    sub: 'شريك في شبكة Shelfy',       color: '#378ADD', bg: '#e6f1fb', Icon: Store },
          { value: s2, suffix: '',  label: 'ساعة بث يومياً', sub: 'إعلانك يعمل طوال اليوم',    color: '#00c9a7', bg: '#e6fbf7', Icon: Clock },
          { value: s3, suffix: '+', label: 'مشاهدة شهرياً', sub: 'مستهلك يرى إعلانك',          color: '#f59e0b', bg: '#fef9e6', Icon: Eye   },
          { value: s4, suffix: '%', label: 'رضا العملاء',   sub: 'نسبة رضا العملاء العام',     color: '#a78bfa', bg: '#f3f0fe', Icon: Star  },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 18, padding: '28px 22px',
            border: '1px solid #eee', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${s.color}20` }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <s.Icon size={22} color={s.color} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {s.value.toLocaleString('ar-SA')}{s.suffix}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginTop: 8 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── About ───────────────────────────────────── */
function About() {
  return (
    <section id="about" style={{ background: 'white', padding: '88px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
            من نحن
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0e1117', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.02em' }}>
            الوصول للمستهلك<br />
            <span style={{ color: '#378ADD' }}>في اللحظة المناسبة</span>
          </h2>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 2, marginBottom: 16 }}>
            Shelfy Screens شركة سعودية متخصصة في الإعلانات الرقمية داخل نقاط البيع. نربط العلامات التجارية بشبكتنا المنتشرة من الشاشات الرقمية في الميني ماركت عبر المملكة.
          </p>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 2, marginBottom: 28 }}>
            نؤمن بأن أفضل لحظة للإعلان هي عندما يكون المستهلك أمام الرف مباشرة — وهذا بالضبط ما نوفره.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { Icon: Target,   text: 'استهداف جغرافي دقيق', color: '#378ADD' },
              { Icon: Zap,      text: 'إطلاق خلال 24 ساعة',  color: '#f59e0b' },
              { Icon: BarChart2, text: 'تقارير لحظية',         color: '#00c9a7' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#f7f8fa', borderRadius: 10, padding: '9px 14px',
                fontSize: 13, color: '#333', fontWeight: 600,
                border: '1px solid #ebebea',
              }}>
                <f.Icon size={15} color={f.color} strokeWidth={2.5} />
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { Icon: Store,   title: 'ميني ماركت', value: '50+',  color: '#378ADD', bg: '#e6f1fb' },
            { Icon: MapPin,  title: 'مدن في المملكة', value: '8+', color: '#00c9a7', bg: '#e6fbf7' },
            { Icon: Megaphone, title: 'حملة إعلانية', value: '200+', color: '#f59e0b', bg: '#fef9e6' },
            { Icon: Award,   title: 'سنوات خبرة',  value: '3+',  color: '#a78bfa', bg: '#f3f0fe' },
          ].map(c => (
            <div key={c.title} style={{
              background: c.bg, borderRadius: 18, padding: '24px 20px', textAlign: 'center',
              border: `1px solid ${c.color}25`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <c.Icon size={28} color={c.color} strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: c.color, letterSpacing: '-0.02em' }}>{c.value}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4, fontWeight: 600 }}>{c.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Services ────────────────────────────────── */
function Services() {
  const services = [
    { Icon: Monitor,    title: 'شاشات داخل الميني ماركت',    desc: 'شاشات عالية الجودة مثبّتة عند الرفوف ومناطق الدفع — تعرض إعلانك للمستهلك في لحظة اتخاذ القرار', color: '#378ADD', bg: '#e6f1fb' },
    { Icon: Sparkles,   title: 'تصميم وإنشاء الحملات',        desc: 'فريقنا الإبداعي يصمم لك المحتوى الإعلاني المناسب — من الفيديو إلى الصورة — بأسلوب يجذب الانتباه', color: '#ec4899', bg: '#fce7f3' },
    { Icon: Target,     title: 'استهداف دقيق',                desc: 'حدّد المتاجر والمناطق الجغرافية والأوقات التي تريد فيها عرض إعلانك — دقة تصل إلى ساعة بساعة', color: '#00c9a7', bg: '#e6fbf7' },
    { Icon: BarChart2,  title: 'تقارير مفصّلة',               desc: 'لوحة تحكم تعرض مرات المشاهدة، ساعات البث، وأداء كل حملة بشكل لحظي مباشر', color: '#f59e0b', bg: '#fef9e6' },
    { Icon: Rocket,     title: 'إطلاق سريع',                  desc: 'أطلق حملتك في أقل من 24 ساعة — فريقنا يتولى التركيب والإعداد الكامل بدون تعقيد', color: '#a78bfa', bg: '#f3f0fe' },
    { Icon: Smartphone, title: 'إدارة من أي مكان',            desc: 'عدّل حملتك، وراجع نتائجك، وتواصل معنا في أي وقت — من هاتفك أو حاسوبك', color: '#22c55e', bg: '#e6fdf0' },
  ]

  return (
    <section id="services" style={{ background: '#f7f8fa', padding: '88px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            خدماتنا
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0e1117', marginBottom: 14, letterSpacing: '-0.02em' }}>
            كل ما تحتاجه لحملة إعلانية ناجحة
          </h2>
          <p style={{ fontSize: 16, color: '#888', maxWidth: 520, margin: '0 auto', lineHeight: 1.9 }}>
            من التصميم حتى التقرير — Shelfy يوفر منظومة متكاملة لإيصال إعلانك للمستهلك
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {services.map(s => (
            <div key={s.title} style={{
              background: 'white', border: '1px solid #eee', borderRadius: 18, padding: '28px 24px',
              transition: 'all 0.22s', cursor: 'default',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = s.color; el.style.boxShadow = `0 12px 40px ${s.color}20`; el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = '#eee'; el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ width: 52, height: 52, background: s.bg, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <s.Icon size={24} color={s.color} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 10 }}>{s.title}</h3>
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
  const steps = [
    { num: '01', title: 'أرسل بياناتك',   desc: 'املأ النموذج وأخبرنا عن منتجك وجمهورك المستهدف والمناطق التي تريد الوصول إليها', Icon: ClipboardList, color: '#378ADD', bg: '#e6f1fb' },
    { num: '02', title: 'نصمم ونُطلق',    desc: 'فريقنا يصمم لك الحملة ويختار الشاشات المناسبة — تُطلق الحملة خلال 24 ساعة',       Icon: Sparkles,     color: '#00c9a7', bg: '#e6fbf7' },
    { num: '03', title: 'تابع النتائج',   desc: 'يبدأ عرض إعلانك فوراً وتتابع الأداء لحظة بلحظة عبر بوابتك الخاصة',              Icon: TrendingUp,   color: '#a78bfa', bg: '#f3f0fe' },
  ]
  return (
    <section id="how" style={{ background: 'white', padding: '88px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            كيف يعمل
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0e1117', letterSpacing: '-0.02em' }}>ثلاث خطوات بسيطة</h2>
          <p style={{ fontSize: 15, color: '#999', marginTop: 12, lineHeight: 1.8 }}>من اللحظة التي تتواصل فيها معنا إلى إطلاق حملتك</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 44, right: '16.5%', left: '16.5%', height: 1, background: 'linear-gradient(90deg, #378ADD30, #00c9a730, #a78bfa30)', zIndex: 0 }} />
          {steps.map((s) => (
            <div key={s.num} style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
                background: s.bg, border: `2px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.Icon size={36} color={s.color} strokeWidth={1.6} />
              </div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 800, marginBottom: 10, letterSpacing: '0.1em' }}>{s.num}</div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#111', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.9, maxWidth: 240, margin: '0 auto' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Lead Form ───────────────────────────────── */
function StartForm() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', city: '', notes: '' })
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    const msg = `مرحباً فريق Shelfy\n\nأريد البدء بحملة إعلانية:\n\n• الاسم: ${form.name}\n• الشركة/العلامة: ${form.company}\n• رقم التواصل: ${form.phone}\n• المدينة: ${form.city}\n• تفاصيل إضافية: ${form.notes || 'لا يوجد'}`
    window.open(`https://wa.me/966XXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank')
    setSent(true)
  }

  return (
    <section id="start" style={{ background: '#0e1117', padding: '96px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.2)', color: '#7ec8f5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
            ابدأ الآن
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: 'white', marginBottom: 14, letterSpacing: '-0.02em' }}>
            أطلق حملتك الإعلانية
          </h2>
          <p style={{ fontSize: 15, color: '#7788a0', lineHeight: 1.9 }}>
            أرسل بياناتك وسيتواصل معك فريقنا خلال ساعات لتصميم حملتك المثالية
          </p>
        </div>

        {sent ? (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: '48px', textAlign: 'center' }}>
            <CheckCircle size={52} color="#4ade80" strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ color: '#4ade80', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>تم الإرسال!</h3>
            <p style={{ color: '#7788a0', fontSize: 15, lineHeight: 1.8 }}>فُتحت نافذة واتساب بمعلوماتك — سيتواصل معك فريقنا قريباً</p>
            <button onClick={() => setSent(false)} style={{ marginTop: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 14 }}>
              إرسال طلب آخر
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { key: 'name', label: 'الاسم الكامل', placeholder: 'محمد صالح', required: true },
                { key: 'company', label: 'اسم الشركة / العلامة التجارية', placeholder: 'شركة المثال', required: false },
                { key: 'phone', label: 'رقم الواتساب', placeholder: '05xxxxxxxx', required: true, ltr: true },
              ].map(f => (
                <div key={f.key} style={f.key === 'phone' ? {} : {}}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>
                    {f.label} {f.required && <span style={{ color: '#f43f5e' }}>*</span>}
                  </label>
                  <input
                    required={f.required}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    dir={f.ltr ? 'ltr' : undefined}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: 'white', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: f.ltr ? 'left' : undefined as any }}
                    onFocus={e => (e.target.style.borderColor = '#378ADD')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>المدينة</label>
                <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: form.city ? 'white' : '#555', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}>
                  <option value="" style={{ background: '#1a2030' }}>— اختر المدينة —</option>
                  {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الطائف','أبها'].map(c => (
                    <option key={c} value={c} style={{ background: '#1a2030' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>تفاصيل إضافية (اختياري)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3} placeholder="أخبرنا عن منتجك وما تريد تحقيقه..."
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: 'white', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#378ADD')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <button type="submit" style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: 'linear-gradient(135deg, #378ADD, #185FA5)',
              border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              boxShadow: '0 4px 20px rgba(55,138,221,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'transform 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <MessageCircle size={20} />
              أرسل طلبي عبر واتساب
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 14 }}>
              سنتواصل معك خلال ساعات لمناقشة التفاصيل
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

/* ─── Client Login ────────────────────────────── */
function ClientLogin() {
  return (
    <section id="login" style={{ background: '#080c14', padding: '52px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#3a3f50', marginBottom: 14 }}>هل أنت عميل لدى Shelfy؟</p>
        <a href="/portal-login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          color: '#555', textDecoration: 'none',
          padding: '11px 24px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#aaa'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#555'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          <Users size={15} />
          دخول بوابة العملاء
        </a>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: '#060810', padding: '44px 5% 32px', fontFamily: 'Cairo, sans-serif', direction: 'rtl', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 36 }}>
          <div>
            <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 38, objectFit: 'contain', marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: '#2e3340', margin: 0, lineHeight: 1.8, maxWidth: 240 }}>
              شبكة الإعلانات الرقمية داخل نقاط البيع<br />المملكة العربية السعودية
            </p>
          </div>
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <p style={{ color: '#444', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: '0.05em' }}>التنقل</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['من نحن','#about'],['الخدمات','#services'],['كيف يعمل','#how'],['ابدأ حملتك','#start']].map(([label, href]) => (
                  <a key={label} href={href} style={{ color: '#333', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#777')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#333')}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: '#444', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: '0.05em' }}>تواصل معنا</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="https://wa.me/966XXXXXXXXX" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#333', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#25D366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                  <MessageCircle size={14} /> واتساب
                </a>
                <a href="mailto:hello@shelfyscreens.com"
                  style={{ color: '#333', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#777')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                  <Mail size={14} /> hello@shelfyscreens.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 11, color: '#1e2230', margin: 0 }}>© {new Date().getFullYear()} Shelfy Screens. جميع الحقوق محفوظة.</p>
          <Link href="/dashboard" style={{ fontSize: 11, color: '#1a1f2e', textDecoration: 'none' }}>لوحة التحكم</Link>
        </div>
      </div>
    </footer>
  )
}

/* ─── Main ────────────────────────────────────── */
export default function LandingPage() {
  return (
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
  )
}
