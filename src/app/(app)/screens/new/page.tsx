'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createScreen } from '@/lib/supabase'

function generatePairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 7; i++) {
    if (i === 3) code += '-'
    else code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function NewScreenPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [locationName, setLocationName] = useState('')
  const [orient, setOrient] = useState('landscape')
  const [device, setDevice] = useState('android_stick')
  const [timer, setTimer] = useState(599)
  const [saving, setSaving] = useState(false)
  const [pairCode] = useState(generatePairCode)
  const [playerUrl, setPlayerUrl] = useState('')

  useEffect(() => {
    setPlayerUrl(`${window.location.origin}/player/${pairCode}`)
    const t = setInterval(() => setTimer(v => v > 0 ? v - 1 : 600), 1000)
    return () => clearInterval(t)
  }, [pairCode])

  const m = Math.floor(timer / 60)
  const s = timer % 60

  const save = async () => {
    if (!name || !locationName) return alert('يرجى تعبئة اسم الشاشة والموقع')
    setSaving(true)
    const result = await createScreen({
      name,
      pair_code: pairCode,
      orientation: orient,
      device_type: device,
      status: 'offline',
    })
    setSaving(false)
    if (result) {
      alert(`تم ربط الشاشة "${name}" بنجاح!\n\nافتح هذا الرابط على الشاشة:\n${playerUrl}`)
      router.push('/screens')
    } else {
      alert('حدث خطأ — تأكد من الاتصال')
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(playerUrl)
    alert('تم نسخ الرابط!')
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
        <div className="card p-5 mb-4">
          <p className="text-sm text-gray-500 mb-3">افتح هذا الرابط على الشاشة:</p>
          <div className="bg-primary-light rounded-xl p-4 text-center mb-3">
            <p className="text-3xl font-bold tracking-widest text-primary font-mono">{pairCode}</p>
          </div>
          <div className="flex gap-2 mb-2">
            <input className="input text-xs" value={playerUrl} readOnly />
            <button onClick={copyUrl} className="btn btn-secondary text-xs flex-shrink-0">نسخ</button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">تنتهي خلال {m}:{s.toString().padStart(2, '0')}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">بيانات الشاشة</p>
          <div className="mb-3">
            <label className="label">اسم الشاشة *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: شاشة العليا 01" />
          </div>
          <div className="mb-3">
            <label className="label">الموقع *</label>
            <input className="input" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="مثال: ميني ماركت الأندلس — العليا" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label">الاتجاه</label>
              <select className="input" value={orient} onChange={e => setOrient(e.target.value)}>
                <option value="landscape">أفقي</option>
                <option value="portrait">عمودي</option>
              </select>
            </div>
            <div>
              <label className="label">نوع الجهاز</label>
              <select className="input" value={device} onChange={e => setDevice(e.target.value)}>
                <option value="android_stick">Android Stick</option>
                <option value="raspberry">Raspberry Pi</option>
                <option value="android_tv">Android TV</option>
                <option value="browser">متصفح</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full py-2.5" onClick={save} disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ وربط الشاشة'}
          </button>
        </div>
      </div>
    </div>
  )
}

