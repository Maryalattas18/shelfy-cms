'use client'
import { useRouter } from 'next/navigation'
import { mockData } from '@/lib/supabase'

const statusMap: Record<string, [string, string]> = {
  online: ['badge-green', 'متصلة'],
  offline: ['badge-red', 'غير متصلة'],
  idle: ['badge-amber', 'خاملة'],
}

export default function ScreenDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const screen = mockData.screens.find(s => s.id === params.id) || mockData.screens[0]
  const [cls, label] = statusMap[screen.status] || ['badge-gray', screen.status]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/screens')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="page-title">{screen.name}</h1>
          <p className="text-sm text-gray-400">{screen.location?.name}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary">إعادة تشغيل</button>
          <button className="btn btn-danger">فصل الشاشة</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card p-4">
          <p className="section-title mb-3">معلومات الجهاز</p>
          {[
            ['الحالة', <span className={`badge ${cls}`}>{label}</span>],
            ['آخر اتصال', screen.last_seen],
            ['نوع الجهاز', 'Android Stick'],
            ['الاتجاه', 'أفقي (Landscape)'],
            ['كود الربط', <span className="font-mono text-primary text-sm">{screen.pair_code}</span>],
          ].map(([k, v]: any) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <p className="section-title mb-3">يعرض الآن</p>
          <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center text-sm text-gray-500 mb-3">
            {screen.status === 'online' ? 'رمضان 2026 — بيبسي' : screen.status === 'idle' ? 'لا يوجد محتوى' : 'انقطع الاتصال'}
          </div>
          <p className="text-xs text-gray-400">الحملة التالية: <span className="text-gray-700 font-medium">عروض الصيف — 12:00</span></p>
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50"><p className="section-title">الجدولة على هذه الشاشة</p></div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="th">الحملة</th><th className="th">الوقت</th><th className="th">الأيام</th>
          </tr></thead>
          <tbody>
            {screen.status !== 'offline' ? (
              <>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="td font-medium">رمضان 2026</td>
                  <td className="td text-gray-600">08:00 – 22:00</td>
                  <td className="td text-gray-600">أحد – خميس</td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="td font-medium">عروض الصيف</td>
                  <td className="td text-gray-600">12:00 – 18:00</td>
                  <td className="td text-gray-600">يومياً</td>
                </tr>
              </>
            ) : (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد جدولة نشطة</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
