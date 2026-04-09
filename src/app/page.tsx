'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

/* ─── intersection hook ──────────────────────── */
function useVisible(ref: React.RefObject<HTMLElement>) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return vis
}

/* ─── Nav ─────────────────────────────────────── */
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
      background: scrolled ? 'rgba(14,17,23,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s',
      padding: '14px 5%',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'Cairo, sans-serif', direction: 'rtl',
    }}>
      <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 40, objectFit: 'contain' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <a href="#services" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}>الخدمات</a>
        <a href="#how" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}>كيف يعمل</a>
        <a href="#login" style={{
          background: 'linear-gradient(135deg, #378ADD, #185FA5)',
          color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600,
          padding: '8px 18px', borderRadius: 10,
          boxShadow: '0 2px 12px rgba(55,138,221,0.35)',
        }}>دخول العملاء</a>
        <Link href="/dashboard" style={{ color: '#666', textDecoration: 'none', fontSize: 13, padding: '8px 14px', borderRadius: 8 }}>
          لوحة التحكم
        </Link>
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
      textAlign: 'center', padding: '100px 5% 60px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* خلفية متوهجة */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(55,138,221,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,201,167,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.25)',
        borderRadius: 999, padding: '6px 16px', marginBottom: 28,
        fontSize: 12, color: '#7ec8f5', fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        شبكة إعلانات رقمية نشطة في المملكة العربية السعودية
      </div>

      <h1 style={{
        fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
        color: 'white', lineHeight: 1.1, marginBottom: 20, maxWidth: 800,
        letterSpacing: '-0.02em',
      }}>
        أوصل إعلانك لكل{' '}
        <span style={{ background: 'linear-gradient(135deg, #378ADD, #00c9a7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ميني ماركت
        </span>
        {' '}في السعودية
      </h1>

      <p style={{ fontSize: 18, color: '#8899aa', lineHeight: 1.8, maxWidth: 560, marginBottom: 40 }}>
        Shelfy Screens شبكة شاشات إعلانية رقمية داخل الميني ماركت — تعرض إعلانك للمستهلك في لحظة القرار
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="#login" style={{
          background: 'linear-gradient(135deg, #378ADD, #185FA5)',
          color: 'white', textDecoration: 'none',
          padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
          boxShadow: '0 4px 24px rgba(55,138,221,0.4)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(55,138,221,0.5)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(55,138,221,0.4)' }}
        >
          ابدأ حملتك الإعلانية
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style={{ transform: 'rotate(180deg)' }}>
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </a>
        <a href="#how" style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'white', textDecoration: 'none',
          padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'}
        >
          كيف يعمل النظام؟
        </a>
      </div>

      {/* Mockup */}
      <div style={{ marginTop: 64, position: 'relative', maxWidth: 720, width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(55,138,221,0.15), rgba(0,201,167,0.1))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 3,
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}>
          <div style={{ background: '#131820', borderRadius: 18, padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'مرات العرض', value: '124,500', color: '#378ADD' },
                { label: 'الشاشات النشطة', value: '48', color: '#00c9a7' },
                { label: 'الحملات', value: '23', color: '#f59e0b' },
                { label: 'العملاء', value: '17', color: '#a78bfa' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 80, background: 'rgba(55,138,221,0.08)', borderRadius: 10, border: '1px solid rgba(55,138,221,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 50 }}>
                {[30,45,35,60,75,55,80,65,70,85,60,90].map((h, i) => (
                  <div key={i} style={{ width: 18, height: h * 0.6, background: `rgba(55,138,221,${0.3 + i * 0.05})`, borderRadius: 4 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </section>
  )
}

/* ─── Stats ───────────────────────────────────── */
function Stats() {
  const ref = useRef<HTMLElement>(null!)
  const vis = useVisible(ref)
  const s1 = useCountUp(50, vis)
  const s2 = useCountUp(200, vis)
  const s3 = useCountUp(1500000, vis)
  const s4 = useCountUp(98, vis)

  return (
    <section ref={ref} style={{ background: '#f7f8fa', padding: '64px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {[
          { value: s1, suffix: '+', label: 'ميني ماركت',     sub: 'في شبكة Shelfy',      color: '#378ADD' },
          { value: s2, suffix: '+', label: 'شاشة إعلانية',   sub: 'منتشرة في المملكة',   color: '#00c9a7' },
          { value: s3, suffix: '+', label: 'مرة مشاهدة',     sub: 'كل شهر',              color: '#f59e0b' },
          { value: s4, suffix: '%', label: 'رضا العملاء',    sub: 'نسبة الرضا العام',    color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 16, padding: '28px 24px',
            border: '1px solid #ebebea', textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: 40, fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>
              {s.value.toLocaleString('ar-SA')}{s.suffix}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Services ────────────────────────────────── */
function Services() {
  const services = [
    {
      icon: '📺', title: 'شاشات داخل الميني ماركت',
      desc: 'شاشات عالية الجودة مثبّتة عند الرفوف ومناطق الدفع — تعرض إعلانك للمستهلك في لحظة اتخاذ القرار',
      color: '#378ADD',
    },
    {
      icon: '🎯', title: 'استهداف دقيق',
      desc: 'حدّد المتاجر والمناطق الجغرافية والأوقات التي تريد فيها عرض إعلانك — دقة تصل إلى ساعة بساعة',
      color: '#00c9a7',
    },
    {
      icon: '📊', title: 'تقارير مفصّلة',
      desc: 'لوحة تحكم تعرض مرات المشاهدة، ساعات العرض، وأداء كل حملة بشكل لحظي',
      color: '#f59e0b',
    },
    {
      icon: '🚀', title: 'إطلاق سريع',
      desc: 'أطلق حملتك في أقل من 24 ساعة — فريقنا يتولى التركيب والإعداد الكامل',
      color: '#a78bfa',
    },
    {
      icon: '🤝', title: 'شراكة مع المتاجر',
      desc: 'شبكة من الميني ماركت الشريكة الموثوقة في مدن المملكة — تغطية واسعة ومستمرة',
      color: '#f43f5e',
    },
    {
      icon: '📱', title: 'إدارة من أي مكان',
      desc: 'عدّل حملتك، وراجع نتائجك، وتواصل معنا — كل ذلك من هاتفك أو حاسوبك',
      color: '#22c55e',
    },
  ]

  return (
    <section id="services" style={{ background: 'white', padding: '80px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            خدماتنا
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0e1117', marginBottom: 14, letterSpacing: '-0.02em' }}>
            كل ما تحتاجه لحملة إعلانية ناجحة
          </h2>
          <p style={{ fontSize: 16, color: '#888', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
            من التخطيط حتى التقرير — Shelfy يوفر منظومة متكاملة لإيصال إعلانك للمستهلك
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {services.map(s => (
            <div key={s.title} style={{
              border: '1px solid #ebebea', borderRadius: 16, padding: '28px 24px',
              transition: 'all 0.2s', cursor: 'default',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = s.color; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${s.color}18`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#ebebea'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
            >
              <div style={{ width: 48, height: 48, background: s.color + '15', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>{s.desc}</p>
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
    { num: '01', title: 'تواصل معنا', desc: 'أخبرنا عن منتجك وجمهورك المستهدف والمناطق التي تريد الوصول إليها', icon: '💬' },
    { num: '02', title: 'صمّم حملتك', desc: 'ارفع إعلاناتك واختر الشاشات والأوقات المناسبة من لوحة التحكم', icon: '🎨' },
    { num: '03', title: 'أطلق وتابع', desc: 'يبدأ عرض إعلانك فوراً وتتابع الأداء لحظة بلحظة عبر تقاريرنا', icon: '📈' },
  ]
  return (
    <section id="how" style={{ background: '#f7f8fa', padding: '80px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#e6f1fb', color: '#185FA5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            كيف يعمل
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0e1117', letterSpacing: '-0.02em' }}>
            ثلاث خطوات فقط
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ position: 'relative', textAlign: 'center' }}>
              {i < 2 && (
                <div style={{ position: 'absolute', top: 40, left: '-50%', width: '100%', height: 1, background: 'linear-gradient(90deg, #378ADD40, transparent)', zIndex: 0 }} />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, boxShadow: '0 8px 24px rgba(55,138,221,0.3)',
                }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: '#378ADD', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em' }}>{s.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Client Login ────────────────────────────── */
function ClientLogin() {
  return (
    <section id="login" style={{ background: '#0e1117', padding: '80px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.2)', color: '#7ec8f5', borderRadius: 999, padding: '5px 18px', fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
          بوابة العملاء
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 12, letterSpacing: '-0.02em' }}>
          تابع حملاتك الإعلانية
        </h2>
        <p style={{ fontSize: 15, color: '#8899aa', marginBottom: 36, lineHeight: 1.8 }}>
          سجّل دخولك ببريدك الإلكتروني وكلمة المرور للوصول إلى تقاريرك وحملاتك
        </p>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
          <a
            href="/portal-login"
            style={{
              display: 'block', width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #378ADD, #185FA5)',
              borderRadius: 12, color: 'white', textDecoration: 'none',
              fontSize: 15, fontWeight: 700,
              boxShadow: '0 4px 20px rgba(55,138,221,0.4)',
              marginBottom: 16,
            }}
          >
            دخول إلى بوابتي
          </a>
          <p style={{ fontSize: 12, color: '#555', marginTop: 16 }}>
            لا يوجد لديك حساب؟{' '}
            <a href={`https://wa.me/966XXXXXXXXX`} target="_blank" rel="noopener noreferrer" style={{ color: '#378ADD', textDecoration: 'none' }}>
              تواصل معنا
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: '#080b10', padding: '40px 5%', fontFamily: 'Cairo, sans-serif', direction: 'rtl', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 36, objectFit: 'contain', marginBottom: 10 }} />
          <p style={{ fontSize: 12, color: '#444', margin: 0 }}>شبكة الإعلانات الرقمية — المملكة العربية السعودية</p>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['الخدمات','#services'],['كيف يعمل','#how'],['دخول العملاء','#login']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: '#555', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}>{label}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#333', margin: 0 }}>
          © {new Date().getFullYear()} Shelfy Screens. جميع الحقوق محفوظة.
        </p>
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
      <Services />
      <HowItWorks />
      <ClientLogin />
      <Footer />
    </div>
  )
}
