'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewScreenPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loc, setLoc] = useState('')
  const [orient, setOrient] = useState('landscape')
  const [device, setDevice] = useState('android_stick')
  const [timer, setTimer] = useState(599)
  const code = 'XK7-49M'

  useEffect(() => {
    const t = setInterval(() => setTimer(v => v > 0 ? v - 1 : 600), 1000)
    return () => clearInterval(t)
  }, [])

  const m = Math.floor(timer / 60), s = timer % 60

  const save = () => {
    if (!name || !loc) return alert('يرجى تعبئة اسم الشاشة والموقع')
    alert(`تم ربط الشاشة "${name}" بنجاح!`)
    router.push('/screens')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/screens')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="page-title">ربط شاشة جديدة</h1>
      </div>
      <div className="max-w-md">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-3">شغّل تطبيق Shelfy على الجهاز — ستظهر هذه الشفرة:</p>
          <div className="bg-primary-light rounded-xl p-4 text-center mb-2">
            <p className="text-3xl font-bold tracking-widest text-primary font-mono">{code}</p>
          </div>
          <p className="text-xs text-gray-400 text-center mb-5">تنتهي خلال {m}:{s.toString().padStart(2, '0')}</p>
          <div className="mb-3"><label className="label">اسم الشاشة *</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: شاشة العليا 01" /></div>
          <div className="mb-3"><label className="label">الموقع *</label>
            <select className="input" value={loc} onChange={e => setLoc(e.target.value)}>
              <option value="">— اختر موقعاً —</option>
              <option>م. الأندلس — العليا</option>
              <option>م. الريم — النرجس</option>
              <option>م. النخيل — الملقا</option>
              <option>+ موقع جديد</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="label">الاتجاه</label>
              <select className="input" value={orient} onChange={e => setOrient(e.target.value)}>
                <option value="landscape">أفقي</option><option value="portrait">عمودي</option>
              </select>
            </div>
            <div><label className="label">نوع الجهاز</label>
              <select className="input" value={device} onChange={e => setDevice(e.target.value)}>
                <option value="android_stick">Android Stick</option>
                <option value="raspberry">Raspberry Pi</option>
                <option value="android_tv">Android TV</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full py-2.5" onClick={save}>ربط الشاشة</button>
        </div>
      </div>
    </div>
  )
}
