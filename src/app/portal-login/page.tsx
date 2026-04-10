'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LangProvider, useLang } from '@/lib/LangContext'

function PortalLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const { t, dir, toggle } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [changeMode, setChangeMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const login = async () => {
    if (!email || !password) return setError(t('plog_email') + ' / ' + t('plog_pw'))
    setLoading(true); setError('')
    const res = await fetch('/api/auth/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    window.location.href = `/portal/${data.token}`
  }

  const changePassword = async () => {
    if (!newPassword || !confirm) return setError(t('plog_new_pw') + ' / ' + t('plog_confirm_pw'))
    if (newPassword !== confirm) return setError('كلمتا المرور غير متطابقتين')
    if (newPassword.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    setLoading(true); setError('')
    const res = await fetch('/api/auth/client', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, currentPassword: password, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setSuccessMsg(t('plog_changed_ok'))
    setChangeMode(false)
    setNewPassword(''); setConfirm('')
    setLoading(false)
  }

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white',
    fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none',
    boxSizing: 'border-box', ...extra,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0e1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif', direction: dir, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo + Lang */}
        <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
          <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 52, objectFit: 'contain', mixBlendMode: 'screen' }} />
          <button onClick={toggle} style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            insetInlineEnd: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#8899aa', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
            fontFamily: 'Cairo, sans-serif', fontWeight: 700,
          }}>{t('lang_btn')}</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 }}>
            {changeMode ? t('plog_change_title') : t('plog_title')}
          </h1>
          <p style={{ fontSize: 13, color: '#8899aa', marginBottom: 24 }}>
            {changeMode ? t('plog_change_sub') : t('plog_sub')}
          </p>

          {successMsg && (
            <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#4ade80', fontSize: 13 }}>
              {successMsg}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 6, fontWeight: 600 }}>{t('plog_email')}</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); setSuccessMsg('') }}
              placeholder="example@company.com"
              style={inp({ direction: 'ltr', textAlign: 'left' })}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 6, fontWeight: 600 }}>
              {changeMode ? t('plog_cur_pw') : t('plog_pw')}
            </label>
            <input type="password" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => !changeMode && e.key === 'Enter' && login()}
              placeholder="••••••••"
              style={inp({ border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, letterSpacing: '0.1em' })}
              onFocus={e => !error && (e.target.style.borderColor = '#378ADD')}
              onBlur={e => !error && (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
          </div>

          {changeMode && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 6, fontWeight: 600 }}>{t('plog_new_pw')}</label>
                <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError('') }} placeholder="••••••••" style={inp({ letterSpacing: '0.1em' })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 6, fontWeight: 600 }}>{t('plog_confirm_pw')}</label>
                <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }} placeholder="••••••••" style={inp({ letterSpacing: '0.1em' })} />
              </div>
            </>
          )}

          {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

          <button onClick={changeMode ? changePassword : login} disabled={loading}
            style={{ width: '100%', padding: 12, marginBottom: 12, background: loading ? 'rgba(55,138,221,0.4)' : 'linear-gradient(135deg, #378ADD, #185FA5)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif' }}>
            {loading ? t('plog_loading') : changeMode ? t('plog_change_btn') : t('plog_btn')}
          </button>

          <button onClick={() => { setChangeMode(m => !m); setError(''); setSuccessMsg('') }}
            style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#8899aa', fontSize: 13, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
            {changeMode ? t('plog_back') : t('plog_change')}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#333' }}>
          <a href="/" style={{ color: '#378ADD', textDecoration: 'none' }}>shelfyscreens.com</a>
          {' · '}Shelfy Screens
        </p>
      </div>
    </div>
  )
}

function PortalLoginWithLang() {
  return (
    <LangProvider>
      <Suspense><PortalLoginForm /></Suspense>
    </LangProvider>
  )
}

export default function PortalLoginPage() {
  return <PortalLoginWithLang />
}
