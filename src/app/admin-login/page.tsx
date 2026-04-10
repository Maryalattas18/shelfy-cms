'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (!password) return setError('أدخل كلمة المرور')
    setLoading(true); setError('')
    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    window.location.href = '/dashboard'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0e1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 52, objectFit: 'contain', mixBlendMode: 'screen' }} />
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 32,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 }}>لوحة التحكم</h1>
          <p style={{ fontSize: 13, color: '#8899aa', marginBottom: 28 }}>أدخل كلمة المرور للمتابعة</p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#8899aa', marginBottom: 8, fontWeight: 600 }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••"
              autoFocus
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, color: 'white', fontSize: 15,
                fontFamily: 'Cairo, sans-serif', outline: 'none',
                boxSizing: 'border-box', letterSpacing: '0.1em',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => !error && (e.target.style.borderColor = '#378ADD')}
              onBlur={e => !error && (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</p>}
          </div>

          <button
            onClick={login}
            disabled={loading}
            style={{
              width: '100%', padding: 13,
              background: loading ? 'rgba(55,138,221,0.4)' : 'linear-gradient(135deg, #378ADD, #185FA5)',
              border: 'none', borderRadius: 12, color: 'white',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Cairo, sans-serif',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(55,138,221,0.35)',
            }}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#333' }}>
          Shelfy Screens · لوحة الإدارة الداخلية
        </p>
      </div>
    </div>
  )
}
