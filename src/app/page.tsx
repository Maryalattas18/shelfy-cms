'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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
      {/* خلفيات متوهجة */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(55,138,221,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,201,167,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Badge */}
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
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style={{ transform: 'rotate(180deg)' }}>
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
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

      {/* Dashboard Mockup */}
      <div style={{ marginTop: 70, position: 'relative', maxWidth: 740, width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(55,138,221,0.18), rgba(0,201,167,0.1))',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 22, padding: 3,
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}>
          <div style={{ background: '#131820', borderRadius: 20, padding: '22px 26px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'مرات العرض', value: '124,500', color: '#378ADD', icon: '▶' },
                { label: 'الشاشات النشطة', value: '48', color: '#00c9a7', icon: '📺' },
                { label: 'الحملات', value: '23', color: '#f59e0b', icon: '📢' },
                { label: 'العملاء', value: '17', color: '#a78bfa', icon: '🤝' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px', border: `1px solid ${s.color}20` }}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 72, background: 'rgba(55,138,221,0.07)', borderRadius: 12, border: '1px solid rgba(55,138,221,0.1)', display: 'flex', alignItems: 'flex-end', padding: '0 16px 10px', gap: 5 }}>
              {[30,45,35,60,75,55,80,65,70,85,60,90,72,88,95].map((h, i) => (
                <div key={i} style={{ flex: 1, height: h * 0.55, background: `linear-gradient(to top, #378ADD${Math.round(50 + i*8).toString(16)}, #00c9a7${Math.round(30 + i*5).toString(16)})`, borderRadius: '3px 3px 0 0', minWidth: 8 }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
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
          { value: s1,       suffix: '+', label: 'ميني ماركت',    sub: 'شريك في شبكة Shelfy',     color: '#378ADD', bg: '#e6f1fb', icon: '🏪' },
          { value: s2,       suffix: '',  label: 'ساعة بث يومياً', sub: 'إعلانك يعمل طوال اليوم',   color: '#00c9a7', bg: '#e6fbf7', icon: '⏱' },
          { value: s3,       suffix: '+', label: 'مشاهدة شهرياً', sub: 'مستهلك يرى إعلانك',       color: '#f59e0b', bg: '#fef9e6', icon: '👁' },
          { value: s4,       suffix: '%', label: 'رضا العملاء',   sub: 'نسبة رضا العملاء العام',   color: '#a78bfa', bg: '#f3f0fe', icon: '⭐' },
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
            <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px' }}>{s.icon}</div>
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
        {/* نص */}
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
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: '🎯', text: 'استهداف جغرافي دقيق' },
              { icon: '⚡', text: 'إطلاق خلال 24 ساعة' },
              { icon: '📊', text: 'تقارير لحظية' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#f7f8fa', borderRadius: 10, padding: '9px 14px',
                fontSize: 13, color: '#333', fontWeight: 600,
                border: '1px solid #ebebea',
              }}>
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* بطاقات مرئية */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '🏪', title: 'ميني ماركت', value: '50+', color: '#378ADD', bg: '#e6f1fb' },
            { icon: '🌍', title: 'مدن في المملكة', value: '8+', color: '#00c9a7', bg: '#e6fbf7' },
            { icon: '📢', title: 'حملة إعلانية', value: '200+', color: '#f59e0b', bg: '#fef9e6' },
            { icon: '🏆', title: 'سنوات خبرة', value: '3+', color: '#a78bfa', bg: '#f3f0fe' },
          ].map(c => (
            <div key={c.title} style={{
              background: c.bg, borderRadius: 18, padding: '24px 20px', textAlign: 'center',
              border: `1px solid ${c.color}25`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
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
    {
      icon: '📺',
      title: 'شاشات داخل الميني ماركت',
      desc: 'شاشات عالية الجودة مثبّتة عند الرفوف ومناطق الدفع — تعرض إعلانك للمستهلك في لحظة اتخاذ القرار',
      color: '#378ADD', bg: '#e6f1fb',
    },
    {
      icon: '🎨',
      title: 'تصميم وإنشاء الحملات',
      desc: 'فريقنا الإبداعي يصمم لك المحتوى الإعلاني المناسب — من الفيديو إلى الصورة — بأسلوب يجذب الانتباه',
      color: '#ec4899', bg: '#fce7f3',
    },
    {
      icon: '🎯',
      title: 'استهداف دقيق',
      desc: 'حدّد المتاجر والمناطق الجغرافية والأوقات التي تريد فيها عرض إعلانك — دقة تصل إلى ساعة بساعة',
      color: '#00c9a7', bg: '#e6fbf7',
    },
    {
      icon: '📊',
      title: 'تقارير مفصّلة',
      desc: 'لوحة تحكم تعرض مرات المشاهدة، ساعات البث، وأداء كل حملة بشكل لحظي مباشر',
      color: '#f59e0b', bg: '#fef9e6',
    },
    {
      icon: '🚀',
      title: 'إطلاق سريع',
      desc: 'أطلق حملتك في أقل من 24 ساعة — فريقنا يتولى التركيب والإعداد الكامل بدون تعقيد',
      color: '#a78bfa', bg: '#f3f0fe',
    },
    {
      icon: '📱',
      title: 'إدارة من أي مكان',
      desc: 'عدّل حملتك، وراجع نتائجك، وتواصل معنا في أي وقت — من هاتفك أو حاسوبك',
      color: '#22c55e', bg: '#e6fdf0',
    },
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
                el.style.borderColor = s.color
                el.style.boxShadow = `0 12px 40px ${s.color}20`
                el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = '#eee'
                el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ width: 52, height: 52, background: s.bg, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>
                {s.icon}
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
    { num: '01', title: 'أرسل بياناتك', desc: 'املأ النموذج أدناه وأخبرنا عن منتجك وجمهورك المستهدف والمناطق التي تريد الوصول إليها', icon: '📋', color: '#378ADD' },
    { num: '02', title: 'نصمم ونُطلق', desc: 'فريقنا يصمم لك الحملة ويختار الشاشات المناسبة — تُطلق الحملة خلال 24 ساعة', icon: '🎨', color: '#00c9a7' },
    { num: '03', title: 'تابع النتائج', desc: 'يبدأ عرض إعلانك فوراً وتتابع الأداء لحظة بلحظة عبر بوابتك الخاصة', icon: '📈', color: '#a78bfa' },
  ]
  return (
    <section id="how" style={{ background: 'white', padding: '88px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            كيف يعمل
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0e1117', letterSpacing: '-0.02em' }}>
            ثلاث خطوات بسيطة
          </h2>
          <p style={{ fontSize: 15, color: '#999', marginTop: 12, lineHeight: 1.8 }}>من اللحظة التي تتواصل فيها معنا إلى إطلاق حملتك</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, position: 'relative' }}>
          {/* خط رابط */}
          <div style={{ position: 'absolute', top: 52, right: '16.5%', left: '16.5%', height: 2, background: 'linear-gradient(90deg, #378ADD40, #00c9a740, #a78bfa40)', zIndex: 0 }} />
          {steps.map((s) => (
            <div key={s.num} style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
                background: `linear-gradient(135deg, ${s.color}22, ${s.color}10)`,
                border: `2px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>{s.icon}</div>
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
    const msg = `مرحباً فريق Shelfy 👋\n\nأريد البدء بحملة إعلانية:\n\n• الاسم: ${form.name}\n• الشركة/العلامة: ${form.company}\n• رقم التواصل: ${form.phone}\n• المدينة: ${form.city}\n• تفاصيل إضافية: ${form.notes || 'لا يوجد'}`
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
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: '#4ade80', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>تم الإرسال!</h3>
            <p style={{ color: '#7788a0', fontSize: 15, lineHeight: 1.8 }}>فُتحت نافذة واتساب بمعلوماتك — سيتواصل معك فريقنا قريباً</p>
            <button onClick={() => setSent(false)} style={{ marginTop: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 14 }}>
              إرسال طلب آخر
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>
                  الاسم الكامل <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="محمد صالح"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: 'white', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>
                  اسم الشركة / العلامة التجارية
                </label>
                <input
                  value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="شركة المثال"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: 'white', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>
                  رقم الواتساب <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="05xxxxxxxx" dir="ltr"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: 'white', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'left' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>المدينة</label>
                <select
                  value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: form.city ? 'white' : '#555', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = '#378ADD')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                >
                  <option value="" style={{ background: '#1a2030' }}>— اختر المدينة —</option>
                  {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الطائف','أبها'].map(c => (
                    <option key={c} value={c} style={{ background: '#1a2030' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 7, fontWeight: 600 }}>تفاصيل إضافية (اختياري)</label>
              <textarea
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.571a.5.5 0 00.611.611l5.746-1.466A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.079-1.389l-.361-.214-3.413.871.887-3.328-.235-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
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
    <section id="login" style={{ background: '#080c14', padding: '60px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#444', marginBottom: 16 }}>هل أنت عميل لدى Shelfy؟</p>
        <a
          href="/portal-login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#888', textDecoration: 'none',
            padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#ccc' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = '#888' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
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
            <p style={{ fontSize: 13, color: '#3a3f50', margin: 0, lineHeight: 1.8, maxWidth: 260 }}>
              شبكة الإعلانات الرقمية داخل نقاط البيع<br />المملكة العربية السعودية
            </p>
          </div>
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <p style={{ color: '#555', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: '0.05em' }}>التنقل</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['من نحن','#about'],['الخدمات','#services'],['كيف يعمل','#how'],['ابدأ حملتك','#start']].map(([label, href]) => (
                  <a key={label} href={href} style={{ color: '#444', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#444')}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: '#555', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: '0.05em' }}>تواصل معنا</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="https://wa.me/966XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ color: '#444', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#25D366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#444')}>واتساب</a>
                <a href="mailto:hello@shelfyscreens.com" style={{ color: '#444', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#444')}>hello@shelfyscreens.com</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 11, color: '#2a2f3d', margin: 0 }}>© {new Date().getFullYear()} Shelfy Screens. جميع الحقوق محفوظة.</p>
          <Link href="/dashboard" style={{ fontSize: 11, color: '#1e2230', textDecoration: 'none' }}>لوحة التحكم</Link>
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
