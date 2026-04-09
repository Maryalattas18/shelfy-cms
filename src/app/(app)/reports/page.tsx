'use client'
import { useState, useEffect } from 'react'

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats?type=reports')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  const noData = !data || data.error

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">التقارير</h1>
        <button className="btn btn-secondary text-sm" onClick={() => window.print()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          طباعة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'مرات العرض',     value: noData ? '—' : data.totalPlays.toLocaleString('ar'),                  sub: 'إجمالي الـ play logs' },
          { label: 'ساعات التشغيل',  value: noData ? '—' : data.totalHours.toLocaleString('ar'),                  sub: 'ساعة فعلية مسجّلة' },
          { label: 'الشاشات المتصلة', value: noData ? '—' : `${data.activeScreens}/${data.totalScreens}`,         sub: 'شاشة online الآن' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Screen Performance */}
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="section-title">أداء الشاشات</p>
          </div>
          <div className="p-4">
            {noData || data.screenStats.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-3">
                {data.screenStats.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0 text-right">
                      <p className="text-xs text-gray-700 font-medium truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.plays.toLocaleString('ar')} عرض</p>
                    </div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${s.pct || 1}%` }} />
                    </div>
                    <div className="w-8 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mx-auto ${s.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client Revenue */}
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="section-title">الإيراد حسب العميل</p>
          </div>
          <div className="p-4">
            {noData || data.clientStats.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">لا توجد حملات مدفوعة بعد</p>
            ) : (
              <div className="space-y-3">
                {data.clientStats.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24 flex-shrink-0 truncate text-right">{c.name}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.pct || 1}%`, background: '#7F77DD' }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-20 flex-shrink-0 text-left">
                      {c.revenue.toLocaleString('ar')} ر
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Play Logs */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="section-title">آخر سجلات العرض</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="th">الملف</th>
              <th className="th">الشاشة</th>
              <th className="th">النوع</th>
              <th className="th">الوقت</th>
              <th className="th">المدة</th>
            </tr>
          </thead>
          <tbody>
            {noData || data.recentLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                  لا توجد سجلات عرض بعد — ستظهر هنا عند تشغيل الـ Player
                </td>
              </tr>
            ) : (
              data.recentLogs.map((l: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="td text-xs font-mono text-gray-600 max-w-xs truncate">{l.media?.file_name || '—'}</td>
                  <td className="td text-gray-600 text-sm">{l.screen?.name || '—'}</td>
                  <td className="td">
                    <span className={`badge ${l.media?.file_type === 'video' ? 'badge-blue' : 'badge-teal'}`}>
                      {l.media?.file_type === 'video' ? 'فيديو' : 'صورة'}
                    </span>
                  </td>
                  <td className="td text-gray-400 text-xs">
                    {l.played_at ? new Date(l.played_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="td text-gray-400 text-xs">{l.duration_sec || 0} ث</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
