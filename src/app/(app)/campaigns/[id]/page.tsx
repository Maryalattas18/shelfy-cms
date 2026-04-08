'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCampaigns, getMedia } from '@/lib/supabase'

const statusMap: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft: ['badge-blue', 'مسودة'],
  ended: ['badge-gray', 'منتهية'],
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCampaigns().then(data => {
      const found = (data as any[]).find(c => c.id === params.id)
      setCampaign(found || null)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  if (!campaign) return (
    <div className="text-center py-20 text-gray-400">
      <p>الحملة غير موجودة</p>
      <button onClick={() => router.push('/campaigns')} className="btn btn-secondary mt-4">رجوع</button>
    </div>
  )

  const [cls, label] = statusMap[campaign.status] || ['badge-gray', campaign.status]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/campaigns')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="page-title">{campaign.name}</h1>
          <p className="text-sm text-gray-400">{campaign.client?.company_name}</p>
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
            ['الأولوية', campaign.priority === 'high' ? 'عالية' : campaign.priority === 'urgent' ? 'طارئة' : 'عادية'],
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
              { label: 'مرات العرض', value: '—' },
              { label: 'ساعات التشغيل', value: '—' },
              { label: 'معدل الأداء', value: '—' },
              { label: 'الشاشات النشطة', value: '—' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {campaign.notes && (
        <div className="card p-4 mb-5">
          <p className="section-title mb-2">ملاحظات</p>
          <p className="text-sm text-gray-600">{campaign.notes}</p>
        </div>
      )}
    </div>
  )
}

