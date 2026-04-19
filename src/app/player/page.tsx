'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'requesting' | 'waiting' | 'expired' | 'error'

export default function PlayerIndex() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('requesting')
  const [tempCode, setTempCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(600)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const requestCode = async () => {
    setPhase('requesting')
    try {
      const res = await fetch('/api/pair/request', { method: 'POST' })
      const data = await res.json()
      if (data.error) { setPhase('error'); return }
      setTempCode(data.tempCode)
      setSecondsLeft(600)
      setPhase('waiting')
    } catch {
      setPhase('error')
    }
  }

  // طلب الكود عند البدء
  useEffect(() => { requestCode() }, [])

  // عداد تنازلي
  useEffect(() => {
    if (phase !== 'waiting') return
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { setPhase('expired'); return 0 }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  // polling كل 3 ثواني
  useEffect(() => {
    if (phase !== 'waiting' || !tempCode) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pair/status?temp=${tempCode}`)
        const data = await res.json()
        if (data.status === 'confirmed' && data.pairCode) {
          if (pollRef.current) clearInterval(pollRef.current)
          router.push(`/player/${data.pairCode}`)
        } else if (data.status === 'expired') {
          setPhase('expired')
        }
      } catch {}
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [phase, tempCode, router])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60

  return (
    <div style={{
      background: '#000', height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 0, padding: 24,
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" style={{ marginBottom: 28 }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>

      {phase === 'requesting' && (
        <p style={T.hint}>جاري التوصيل...</p>
      )}

      {phase === 'waiting' && (
        <>
          <p style={T.hint}>أدخل هذا الكود في لوحة التحكم</p>
          <div style={T.codeBox}>
            {tempCode.split('').map((c, i) => (
              <span key={i} style={T.char}>{c}</span>
            ))}
          </div>
          <p style={T.timer}>
            ينتهي خلال {m}:{s.toString().padStart(2, '0')}
          </p>
          <p style={{ ...T.hint, marginTop: 32, fontSize: 11, color: '#222' }}>
            في انتظار الربط...
          </p>
          <div style={T.dots}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ ...T.dot, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </>
      )}

      {phase === 'expired' && (
        <>
          <p style={{ ...T.hint, color: '#555' }}>انتهت صلاحية الكود</p>
          <button onClick={requestCode} style={T.btn}>طلب كود جديد</button>
        </>
      )}

      {phase === 'error' && (
        <>
          <p style={{ ...T.hint, color: '#555' }}>تعذّر الاتصال بالسيرفر</p>
          <button onClick={requestCode} style={T.btn}>إعادة المحاولة</button>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

const T: Record<string, React.CSSProperties> = {
  hint: {
    color: '#444',
    fontSize: 13,
    fontFamily: 'Cairo, sans-serif',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeBox: {
    display: 'flex',
    gap: 10,
    marginBottom: 14,
  },
  char: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 72,
    background: '#0e0e0e',
    border: '1px solid #1e1e1e',
    borderRadius: 10,
    color: '#fff',
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: 700,
    letterSpacing: 0,
  },
  timer: {
    color: '#2a2a2a',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
  },
  dots: {
    display: 'flex',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#378ADD',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  btn: {
    marginTop: 16,
    background: '#378ADD',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    fontSize: 13,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
  },
}
