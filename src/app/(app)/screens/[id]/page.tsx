'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getScreens, updateScreen, deleteScreen } from '@/lib/supabase'

const statusMap: Record<string, [string, string]> = {
  online:  ['badge-green', 'متصلة'],
  offline: ['badge-red',   'غير متصلة'],
  idle:    ['badge-amber', 'خاملة'],
}

export default function ScreenDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [screen, setScreen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    getScreens().then(data => {
      const found = (data as any[]).find(s => s.id === params.id)
      setScreen(found || null)
      setLoading(false)
    })
  }, [params.id])

  const updateSetting = async (key: string, value: string) => {
    setScreen((s: any) => ({ ...s, [key]: value }))
    await updateScreen(screen.id, { [key]: value })
  }

  const disconnect = async () => {
    if (!confirm(`فصل الشاشة "${screen.name}"؟\nسيتوقف عرض الإعلانات عليها.`)) return
    setWorking(true)
    await updateScreen(screen.id, { status: 'offline', last_seen: null })
    setScreen((s: any) => ({ ...s, status: 'offline', last_seen: null }))
    setWorking(false)
  }

  const handleDelete = async () => {
    if (!confirm(`حذف الشاشة "${screen.name}" نهائياً؟\nسيُحذف كل شيء مرتبط بها.`)) return
    setWorking(true)
    await deleteScreen(screen.id)
    router.push('/screens')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  if (!screen) return (
    <div className="text-center py-20 text-gray-400">
      <p>الشاشة غير موجودة</p>
      <button onClick={() => router.push('/screens')} className="btn btn-secondary mt-4">رجوع</button>
    </div>
  )

  const [cls, label] = statusMap[screen.status] || ['badge-gray', screen.status]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/screens')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="page-title">{screen.name}</h1>
          <p className="text-sm text-gray-400">{screen.location_name || '—'}</p>
        </div>
        <div className="flex gap-2">
          {screen.status !== 'offline' && (
            <button
              onClick={disconnect}
              disabled={working}
              className="btn btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50">
              فصل الشاشة
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={working}
            className="btn btn-danger">
            {working ? '...' : 'حذف الشاشة'}
          </button>
        </div>
      </div>

      {/* ─── Display Settings ─── */}
      <div className="card p-4 mb-5">
        <p className="section-title mb-4">إعدادات العرض</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Orientation */}
          <div>
            <p className="label mb-2">اتجاه الشاشة</p>
            <div className="flex gap-2">
              {[
                { val: 'landscape', ar: 'أفقي', icon: '▬' },
                { val: 'portrait',  ar: 'عمودي', icon: '▮' },
              ].map(o => (
                <button key={o.val} onClick={() => updateSetting('orientation', o.val)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                    ${screen.orientation === o.val
                      ? 'bg-primary-light text-primary border-primary'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  <span className="block text-lg mb-0.5">{o.icon}</span>
                  {o.ar}
                </button>
              ))}
            </div>
          </div>

          {/* Fit Mode */}
          <div>
            <p className="label mb-2">وضع ملاءمة الإعلان</p>
            <div className="flex gap-2">
              {[
                { val: 'cover',   ar: 'تعبئة', desc: 'يملأ الشاشة' },
                { val: 'contain', ar: 'احتواء', desc: 'كامل مع شريط' },
                { val: 'fill',    ar: 'مد',    desc: 'يمد الصورة' },
              ].map(f => (
                <button key={f.val} onClick={() => updateSetting('fit_mode', f.val)}
                  className={`flex-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all
                    ${(screen.fit_mode || 'cover') === f.val
                      ? 'bg-primary-light text-primary border-primary'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  <span className="block font-semibold text-sm">{f.ar}</span>
                  <span className="block opacity-60 mt-0.5">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card p-4">
          <p className="section-title mb-3">معلومات الجهاز</p>
          {[
            ['الحالة',     <span className={`badge ${cls}`}>{label}</span>],
            ['آخر اتصال', screen.last_seen ? new Date(screen.last_seen).toLocaleString('ar-SA') : '—'],
            ['نوع الجهاز', screen.device_type || 'Android Stick'],
            ['الاتجاه',   screen.orientation === 'portrait' ? 'عمودي' : 'أفقي'],
            ['كود الربط', <span className="font-mono text-primary text-sm">{screen.pair_code || '—'}</span>],
          ].map(([k, v]: any) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <p className="section-title mb-3">رابط الـ Player</p>
          <div className="bg-primary-light rounded-xl p-3 text-center mb-3">
            <p className="text-xl font-bold tracking-widest text-primary font-mono">{screen.pair_code}</p>
          </div>
          <div className="flex gap-2">
            <input
              className="input text-xs"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/player/${screen.pair_code}`}
              readOnly
            />
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/player/${screen.pair_code}`)}
              className="btn btn-secondary text-xs flex-shrink-0">
              نسخ
            </button>
          </div>
          <a
            href={`/player/${screen.pair_code}`}
            target="_blank"
            className="btn btn-secondary w-full text-center text-xs mt-2 block">
            فتح Player
          </a>
        </div>
      </div>
    </div>
  )
}
