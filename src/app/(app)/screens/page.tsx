'use client'
import { useState, useEffect, useCallback } from 'react'
import { getScreens } from '@/lib/supabase'
import Link from 'next/link'

const statusMap: Record<string, [string, string, string]> = {
  online:  ['badge-green', 'متصلة',       'dot-online'],
  offline: ['badge-red',   'غير متصلة',   'dot-offline'],
  idle:    ['badge-amber', 'خاملة',        'dot-idle'],
}

export default function ScreensPage() {
  const [screens, setScreens] = useState<any[]>([])
  const [nowPlaying, setNowPlaying] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const loadScreens = useCallback(async () => {
    const data = await getScreens() as any[]
    setScreens(data)
    setLoading(false)
    // جلب المحتوى الحالي للشاشات المتصلة
    const onlineIds = data.filter(s => s.status === 'online').map(s => s.id)
    if (onlineIds.length > 0) {
      const res = await fetch(`/api/screen-now?ids=${onlineIds.join(',')}`)
      const json = await res.json()
      setNowPlaying(json)
    }
  }, [])

  // تحميل أولي
  useEffect(() => { loadScreens() }, [loadScreens])

  // تحديث كل 15 ثانية للشاشات المتصلة
  useEffect(() => {
    const interval = setInterval(async () => {
      const onlineIds = screens.filter(s => s.status === 'online').map(s => s.id)
      if (onlineIds.length === 0) return
      const res = await fetch(`/api/screen-now?ids=${onlineIds.join(',')}`)
      const json = await res.json()
      setNowPlaying(json)
    }, 15000)
    return () => clearInterval(interval)
  }, [screens])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">الشاشات</h1>
        <Link href="/screens/new" className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          ربط شاشة جديدة
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {screens.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400 card">
              لا توجد شاشات — <Link href="/screens/new" className="text-primary">أضف شاشة جديدة</Link>
            </div>
          )}
          {screens.map((s: any) => {
            const [badgeCls, badgeLabel, dotCls] = statusMap[s.status] || ['badge-gray', s.status, '']
            const current = nowPlaying[s.id]
            const media = current?.media

            return (
              <Link key={s.id} href={`/screens/${s.id}`}
                className="card p-4 hover:border-primary hover:border transition-all cursor-pointer block">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.location_name || '—'}</p>
                  </div>
                  <span className={`badge ${badgeCls}`}>
                    <span className={`${dotCls} ml-1`} />{badgeLabel}
                  </span>
                </div>

                {/* Preview Area */}
                <div className="rounded-lg overflow-hidden mb-3 bg-gray-900" style={{ height: 120 }}>
                  {s.status === 'online' && media ? (
                    <div className="relative w-full h-full">
                      {media.file_type === 'image' ? (
                        <img
                          src={media.file_url}
                          alt={media.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" width="28" height="28">
                            <polygon points="5 3 19 12 5 21 5 3" fill="#555" stroke="none"/>
                          </svg>
                          <p className="text-xs text-gray-400 text-center px-2 truncate max-w-full">{media.file_name}</p>
                        </div>
                      )}
                      {/* اسم الملف */}
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                        <p className="text-white text-xs truncate">{media.file_name}</p>
                      </div>
                      {/* نقطة تشغيل حية */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white text-xs">LIVE</span>
                      </div>
                    </div>
                  ) : s.status === 'online' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-xs text-gray-500">لا يوجد محتوى مجدول الآن</p>
                    </div>
                  ) : s.status === 'idle' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-xs text-gray-500">لا يوجد محتوى مجدول</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" width="20" height="20">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                      </svg>
                      <p className="text-xs text-gray-600">انقطع الاتصال</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>آخر اتصال: {s.last_seen ? new Date(s.last_seen).toLocaleString('ar-SA') : '—'}</span>
                  <span>كود: <span className="font-mono text-gray-600">{s.pair_code || '—'}</span></span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
