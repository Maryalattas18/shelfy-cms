'use client'
import { useRouter } from 'next/navigation'
import { mockData } from '@/lib/supabase'

const statusMap: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft: ['badge-blue', 'مسودة'],
  ended: ['badge-gray', 'منتهية'],
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const campaign = mockData.campaigns.find(c => c.id === params.id) || mockData.campaigns[0]
  const [cls, label] = statusMap[campaign.status] || ['badge-gray', campaign.status]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/campaigns')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="page-title">{campaign.name}</h1>
          <p className="text-sm text-gray-400">{(campaign.client as any)?.company_name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/campaigns/new')} className="btn btn-secondary">تعديل</button>
          <button className="btn btn-danger">إيقاف</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card p-4">
          <p className="section-title mb-3">تفاصيل الحملة</p>
          {[
            ['الحالة', <span className={`badge ${cls}`}>{label}</span>],
            ['الفترة', `${campaign.start_date} – ${campaign.end_date}`],
            ['السعر', `${Number(campaign.price).toLocaleString('ar')} ريال`],
            ['الشاشات', 'كل الشاشات'],
          ].map(([k, v]: any) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        <div className="card p-4">
          <p className="section-title mb-3">إحصائيات</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'مرات العرض', value: '12,400' },
              { label: 'ساعات التشغيل', value: '310' },
              { label: 'معدل الأداء', value: '94%' },
              { label: 'الشاشات النشطة', value: '4' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="px-4 py-3 border-b border-gray-50"><p className="section-title">المحتوى المرتبط</p></div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {mockData.media.slice(0, 3).map(m => (
            <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="h-14 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                {m.file_type === 'video' ? `فيديو ${m.duration_sec} ث` : 'صورة'}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate">{m.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50"><p className="section-title">جدول العرض</p></div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="th">الشاشة</th><th className="th">الوقت</th><th className="th">الأيام</th><th className="th">المدة</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-gray-50 hover:bg-gray-50">
              <td className="td">كل الشاشات</td>
              <td className="td text-gray-600">08:00 – 22:00</td>
              <td className="td text-gray-600">أحد – خميس</td>
              <td className="td text-gray-600">30 ث</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
