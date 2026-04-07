'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PairScreen() {
  const router = useRouter()
  const [secs, setSecs] = useState(600)
  const [name, setName] = useState('')
  const [loc, setLoc] = useState('')

  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 600), 1000)
    return () => clearInterval(t)
  }, [])

  const m = Math.floor(secs / 60), s = secs % 60

  const pair = () => {
    if (!name || !loc) { alert('يرجى تعبئة الاسم والموقع'); return }
    alert(`تم ربط الشاشة "${name}" بنجاح!`)
    router.push('/screens')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-sm" onClick={() => router.push('/screens')}>→ رجوع</button>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>ربط شاشة جديدة</h1>
      </div>

      <div style={{ maxWidth: 460 }}>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>شغّل تطبيق Shelfy على الجهاز — ستظهر هذه الشفرة:</p>
          <div className="pair-code">XK7-49M</div>
          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginBottom: 20 }}>
            تنتهي خلال {m}:{s.toString().padStart(2, '0')}
          </p>

          <div className="form-group">
            <label className="form-label">اسم الشاشة *</label>
            <input type="text" placeholder="مثال: شاشة العليا 05" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">الموقع *</label>
            <select value={loc} onChange={e => setLoc(e.target.value)}>
              <option value="">— اختر موقعاً —</option>
              <option>م. الأندلس — العليا</option>
              <option>م. الريم — النرجس</option>
              <option>م. النخيل — الملقا</option>
              <option>+ موقع جديد</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">الاتجاه</label>
              <select><option>أفقي</option><option>عمودي</option></select>
            </div>
            <div className="form-group">
              <label className="form-label">نوع الجهاز</label>
              <select><option>Android Stick</option><option>Raspberry Pi</option><option>Android TV</option></select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '10px', marginTop: 4, justifyContent: 'center' }} onClick={pair}>
            ربط الشاشة
          </button>
        </div>
      </div>
    </div>
  )
}
