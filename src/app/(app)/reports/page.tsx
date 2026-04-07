'use client'
import { useState } from 'react'

const screenPerf = [
  { name: 'العليا 01', pct: 96, color: '#378ADD' },
  { name: 'النرجس 02', pct: 91, color: '#378ADD' },
  { name: 'الملقا 03', pct: 78, color: '#EF9F27' },
  { name: 'الروضة 04', pct: 45, color: '#E24B4A' },
]

const clientRev = [
  { name: 'بيبسي', val: 4800, color: '#7F77DD' },
  { name: 'نستله', val: 3900, color: '#7F77DD' },
  { name: 'الكيلو', val: 3000, color: '#7F77DD' },
  { name: 'أرامكو', val: 2100, color: '#7F77DD' },
  { name: 'الألبان', val: 1400, color: '#7F77DD' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('أبريل 2026')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">التقارير</h1>
        <div className="flex gap-2">
          <select className="input w-auto text-sm" value={period} onChange={e => setPeriod(e.target.value)}>
            <option>أبريل 2026</option>
            <option>مارس 2026</option>
            <option>فبراير 2026</option>
          </select>
          <button className="btn btn-secondary">تصدير PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'مرات العرض', value: '48,320', sub: 'هذا الشهر' },
          { label: 'ساعات التشغيل', value: '1,240', sub: 'ساعة فعلية' },
          { label: 'معدل الأداء', value: '94%', sub: 'نسبة التشغيل المجدول' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="section-title">أداء الشاشات</p>
          </div>
          <div className="p-4 space-y-3">
            {screenPerf.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">{s.name}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8 flex-shrink-0">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="section-title">الإيراد حسب العميل</p>
          </div>
          <div className="p-4 space-y-3">
            {clientRev.map(r => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">{r.name}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(r.val / 5000) * 100}%`, background: r.color }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-16 flex-shrink-0">{r.val.toLocaleString('ar')} ر</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-5">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="section-title">سجل العرض الأخير</p>
        </div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="th">الإعلان</th>
            <th className="th">الشاشة</th>
            <th className="th">الحملة</th>
            <th className="th">الوقت</th>
            <th className="th">المدة</th>
          </tr></thead>
          <tbody>
            {[
              ['pepsi-ramadan-30s.mp4', 'العليا 01', 'رمضان 2026', '14:32', '30 ث'],
              ['nestle-summer-20s.mp4', 'النرجس 02', 'عروض الصيف', '14:31', '20 ث'],
              ['pepsi-ramadan-30s.mp4', 'الملقا 03', 'رمضان 2026', '14:30', '30 ث'],
              ['aramco-banner.jpg', 'العليا 01', 'منتج جديد', '14:29', '15 ث'],
              ['kilo-promo-10s.mp4', 'النرجس 02', 'تخفيضات مايو', '14:28', '10 ث'],
            ].map(([ad, sc, cp, t, d], i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="td text-xs font-mono text-gray-600">{ad}</td>
                <td className="td text-gray-600">{sc}</td>
                <td className="td text-gray-600">{cp}</td>
                <td className="td text-gray-400">{t}</td>
                <td className="td text-gray-400">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
