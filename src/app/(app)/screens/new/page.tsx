'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'auto' | 'manual'

function genPairCode(): string {
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
  const [tab, setTab] = useState<Tab>('auto')

  // مشترك
  const [name, setName] = useState('')
  const [locationName, setLocationName] = useState('')
  const [orient, setOrient] = useState('landscape')
  const [device, setDevice] = useState('android_stick')
  const [saving, setSaving] = useState(false)

  // ربط تلقائي
  const [tvCode, setTvCode] = useState('')
  const [autoError, setAutoError] = useState('')
  const [autoSuccess, setAutoSuccess] = useState(false)

  // ربط يدوي
  const [pairCode] = useState(genPairCode)

  const confirmAuto = async () => {
    if (!tvCode.trim()) return setAutoError('أدخل الكود الظاهر على الشاشة')
    if (!name || !locationName) return setAutoError('يرجى تعبئة اسم الشاشة والموقع')
    setSaving(true)
    setAutoError('')
    try {
      const res = await fetch('/api/pair/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempCode: tvCode.trim().toUpperCase(),
          name,
          locationName,
          orientation: orient,
          deviceType: device,
        }),
      })
      const json = await res.json()
      setSaving(false)
      if (json.error) { setAutoError(json.error); return }
      setAutoSuccess(true)
      setTimeout(() => router.push('/screens'), 1500)
    } catch (e: any) {
      setSaving(false)
      setAutoError(e.message)
    }
  }

  const saveManual = async () => {
    if (!name || !locationName) return alert('يرجى تعبئة اسم الشاشة والموقع')
    setSaving(true)
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insert',
          table: 'screens',
          data: { name, location_name: locationName, pair_code: pairCode, orientation: orient, device_type: device, status: 'offline' },
        }),
      })
      const json = await res.json()
      setSaving(false)
      if (json.error) { alert(`خطأ: ${json.error}`); return }
      const url = `${window.location.origin}/player/${pairCode}`
      alert(`تم الحفظ!\n\nافتح هذا الرابط على الشاشة:\n${url}`)
      router.push('/screens')
    } catch (e: any) {
      setSaving(false)
      alert(e.message)
    }
  }

  const Fields = () => (
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
      <div className="grid grid-cols-2 gap-3">
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
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/screens')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="page-title">ربط شاشة جديدة</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('auto')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${tab === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          ربط تلقائي
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${tab === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          ربط يدوي
        </button>
      </div>

      <div className="max-w-md flex flex-col gap-4">

        {/* ── ربط تلقائي ── */}
        {tab === 'auto' && (
          <>
            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-4">
                افتح <span className="font-mono text-gray-700">shelfyscreens.com/player</span> على التلفزيون — سيظهر كود مكوّن من 4 أحرف، أدخله هنا:
              </p>
              <label className="label">الكود الظاهر على الشاشة</label>
              <input
                className="input text-center text-2xl tracking-widest font-mono uppercase"
                value={tvCode}
                onChange={e => { setTvCode(e.target.value.toUpperCase()); setAutoError('') }}
                placeholder="A7X2"
                maxLength={4}
              />
            </div>

            <Fields />

            {autoError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{autoError}</div>
            )}
            {autoSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">تم الربط بنجاح! جاري التحويل...</div>
            )}

            <button className="btn btn-primary w-full py-2.5" onClick={confirmAuto} disabled={saving}>
              {saving ? 'جاري الربط...' : 'ربط الشاشة'}
            </button>
          </>
        )}

        {/* ── ربط يدوي ── */}
        {tab === 'manual' && (
          <>
            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-3">افتح هذا الرابط يدوياً على الشاشة:</p>
              <div className="bg-primary-light rounded-xl p-4 text-center mb-3">
                <p className="text-3xl font-bold tracking-widest text-primary font-mono">{pairCode}</p>
              </div>
              <div className="flex gap-2">
                <input className="input text-xs" value={typeof window !== 'undefined' ? `${window.location.origin}/player/${pairCode}` : `/player/${pairCode}`} readOnly />
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/player/${pairCode}`); alert('تم النسخ!') }}
                  className="btn btn-secondary text-xs flex-shrink-0"
                >نسخ</button>
              </div>
            </div>

            <Fields />

            <button className="btn btn-primary w-full py-2.5" onClick={saveManual} disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ وربط الشاشة'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}
