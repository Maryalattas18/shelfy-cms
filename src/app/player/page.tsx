'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PlayerIndex() {
  const [code, setCode] = useState('')
  const router = useRouter()

  const go = () => {
    if (!code.trim()) return alert('أدخل كود الشاشة')
    router.push(`/player/${code.trim().toUpperCase()}`)
  }

  return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" style={{ marginBottom: 24 }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
      <p style={{ color: '#555', fontSize: 14, fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>أدخل كود الشاشة</p>
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="XXX-XXX"
        maxLength={7}
        style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 20, fontFamily: 'monospace', letterSpacing: 4, textAlign: 'center', width: 200, marginBottom: 12 }}
      />
      <button onClick={go} style={{ background: '#378ADD', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 14, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
        تشغيل
      </button>
    </div>
  )
}
