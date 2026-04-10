'use client'
import { useState, useEffect } from 'react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 14, overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0ee' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{title}</span>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#aaa', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid #e5e7eb', borderRadius: 8,
  fontSize: 13, color: '#222', outline: 'none',
  fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box' as const,
  background: 'white',
}

export default function SettingsPage() {
  // ─── كلمة المرور ───
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // ─── واتساب ───
  const [whatsapp, setWhatsapp] = useState('')
  const [waLoading, setWaLoading] = useState(false)
  const [waSuccess, setWaSuccess] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.whatsapp_number) setWhatsapp(d.whatsapp_number)
        setSettingsLoaded(true)
      })
      .catch(() => setSettingsLoaded(true))
  }, [])

  const changePassword = async () => {
    setPwError(''); setPwSuccess(false)
    if (!currentPw || !newPw || !confirmPw) return setPwError('أدخل جميع الحقول')
    if (newPw !== confirmPw) return setPwError('كلمتا المرور غير متطابقتين')
    if (newPw.length < 6) return setPwError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    if (currentPw === newPw) return setPwError('كلمة المرور الجديدة يجب أن تختلف عن الحالية')
    setPwLoading(true)
    const res = await fetch('/api/auth/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    setPwLoading(false)
    if (!res.ok) return setPwError(data.error)
    setPwSuccess(true)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  const saveWhatsapp = async () => {
    if (!whatsapp) return
    setWaLoading(true); setWaSuccess(false)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'whatsapp_number', value: whatsapp }),
    })
    setWaLoading(false); setWaSuccess(true)
    setTimeout(() => setWaSuccess(false), 3000)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 2 }}>الإعدادات</h1>
        <p style={{ fontSize: 13, color: '#999' }}>إعدادات النظام والحساب</p>
      </div>

      {/* ─── تغيير كلمة المرور ─── */}
      <Section title="تغيير كلمة المرور">
        {pwSuccess && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#15803d', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            تم تغيير كلمة المرور بنجاح
          </div>
        )}
        <div style={{ maxWidth: 400 }}>
          <Field label="كلمة المرور الحالية">
            <input type="password" value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPwError('') }}
              placeholder="••••••••" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
          </Field>
          <Field label="كلمة المرور الجديدة">
            <input type="password" value={newPw} onChange={e => { setNewPw(e.target.value); setPwError('') }}
              placeholder="••••••••" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
          </Field>
          <Field label="تأكيد كلمة المرور الجديدة">
            <input type="password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwError('') }}
              placeholder="••••••••" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
          </Field>
          {pwError && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 14 }}>{pwError}</p>}
          <button onClick={changePassword} disabled={pwLoading} style={{
            padding: '10px 24px', background: pwLoading ? 'rgba(55,138,221,0.4)' : 'linear-gradient(135deg, #378ADD, #185FA5)',
            border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 700,
            cursor: pwLoading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif',
          }}>
            {pwLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </div>
      </Section>

      {/* ─── رقم الواتساب ─── */}
      <Section title="رقم واتساب التواصل">
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          يُستخدم هذا الرقم في زر "تواصل معنا" ضمن بوابة العملاء.
        </p>
        <div style={{ maxWidth: 400 }}>
          <Field label="رقم الواتساب" hint="أدخل الرقم مع رمز الدولة — مثال: 966501234567">
            <input
              type="text" value={settingsLoaded ? whatsapp : ''}
              onChange={e => { setWhatsapp(e.target.value); setWaSuccess(false) }}
              placeholder="966501234567" dir="ltr"
              style={{ ...inputStyle, textAlign: 'left', letterSpacing: '0.05em' }}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={saveWhatsapp} disabled={waLoading || !whatsapp} style={{
              padding: '10px 24px',
              background: (!whatsapp || waLoading) ? 'rgba(55,138,221,0.4)' : 'linear-gradient(135deg, #378ADD, #185FA5)',
              border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 700,
              cursor: (!whatsapp || waLoading) ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif',
            }}>
              {waLoading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            {waSuccess && (
              <span style={{ fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                تم الحفظ
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ─── معلومات النظام ─── */}
      <Section title="معلومات النظام">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'النظام', value: 'Shelfy CMS' },
            { label: 'الإصدار', value: 'v1.0' },
            { label: 'البيئة', value: 'Vercel / Next.js 14' },
          ].map(item => (
            <div key={item.label} style={{ background: '#fafaf8', border: '1px solid #f0f0ee', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── SQL مطلوب ─── */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>⚠️ ملاحظة: SQL مطلوب في Supabase</p>
        <p style={{ fontSize: 12, color: '#78350f', marginBottom: 8 }}>إذا لم تُنشأ بعد جدول الإعدادات، نفّذ هذا الأمر في Supabase SQL Editor:</p>
        <code style={{
          display: 'block', background: '#1e2433', color: '#a8d8a8', padding: '10px 14px',
          borderRadius: 8, fontSize: 12, direction: 'ltr', textAlign: 'left', whiteSpace: 'pre',
          fontFamily: 'monospace',
        }}>{`CREATE TABLE IF NOT EXISTS app_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);`}</code>
      </div>
    </div>
  )
}
