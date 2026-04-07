'use client'
import { mockData } from '@/lib/supabase'
import Link from 'next/link'

const statusMap: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft: ['badge-blue', 'مسودة'],
  ended: ['badge-gray', 'منتهية'],
  online: ['badge-green', 'متصلة'],
  offline: ['badge-red', 'غير متصلة'],
  idle: ['badge-amber', 'خاملة'],
}

export default function DashboardPage() {
  const { stats, campaigns, screens } = mockData
  const date = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">نظرة عامة</h1>
        <p className="text-sm text-gray-400 mt-1">{date}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'الشاشات النشطة', value: `${stats.screens.online}/${stats.screens.total}`, sub: 'شاشة متصلة' },
          { label: 'الحملات الجارية', value: stats.campaigns.active, sub: 'حملة نشطة' },
          { label: 'العملاء', value: stats.clients.total, sub: 'عميل مسجل' },
          { label: 'عروض هذا الشهر', value: stats.plays.thisMonth.toLocaleString('ar'), sub: 'مرة عرض' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
            <span className="section-title">آخر الحملات</span>
            <Link href="/campaigns" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">الحملة</th><th className="th">العميل</th><th className="th">الحالة</th></tr></thead>
            <tbody>
              {campaigns.slice(0, 4).map((c: any) => {
                const [cls, label] = statusMap[c.status] || ['badge-gray', c.status]
                return (
                  <tr key={c.id} className="tr"><td className="td font-medium">{c.name}</td><td className="td text-gray-500">{c.client?.company_name}</td><td className="td"><span className={`badge ${cls}`}>{label}</span></td></tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
            <span className="section-title">حالة الشاشات</span>
            <Link href="/screens" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">الشاشة</th><th className="th">الموقع</th><th className="th">الحالة</th></tr></thead>
            <tbody>
              {screens.map((s: any) => {
                const [cls, label] = statusMap[s.status] || ['badge-gray', s.status]
                const dotCls = s.status === 'online' ? 'dot-online' : s.status === 'offline' ? 'dot-offline' : 'dot-idle'
                return (
                  <tr key={s.id} className="tr"><td className="td"><span className={dotCls}></span>{s.name}</td><td className="td text-gray-500">{s.location?.name}</td><td className="td"><span className={`badge ${cls}`}>{label}</span></td></tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50"><span className="section-title">أداء العملاء — هذا الشهر</span></div>
        <div className="p-4 space-y-3">
          {[{name:'بيبسي',val:4800,color:'#378ADD'},{name:'نستله',val:3900,color:'#1D9E75'},{name:'الكيلو',val:3000,color:'#EF9F27'},{name:'أرامكو',val:2100,color:'#D85A30'},{name:'الألبان السعودية',val:1400,color:'#7F77DD'}].map(r => (
            <div key={r.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">{r.name}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${(r.val/5000)*100}%`,background:r.color}} />
              </div>
              <span className="text-xs text-gray-600 w-16 flex-shrink-0">{r.val.toLocaleString('ar')} ر</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
