'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCampaigns, getCampaignMedia, getCampaignSchedules, updateCampaign, deleteCampaign_ } from '@/lib/supabase'

const STATUS_MAP: Record<string, [string, string]> = {
  active:    ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft:     ['badge-blue',  'مسودة'],
  paused:    ['badge-gray',  'موقوفة'],
  ended:     ['badge-gray',  'منتهية'],
}
const CODE_TO_DAY: Record<string, string> = {
  sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء',
  wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت'
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [media, setMedia] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const load = async () => {
      const [allCamps, cm, sc, st] = await Promise.all([
        getCampaigns(),
        getCampaignMedia(params.id),
        getCampaignSchedules(params.id),
        fetch(`/api/stats?type=campaign&id=${params.id}`).then(r => r.json()),
      ])
      const found = (allCamps as any[]).find(c => c.id === params.id)
      setCampaign(found || null)
      setMedia(cm as any[])
      setSchedules(sc as any[])
      setStats(st)
      setLoading(false)
    }
    load()
  }, [params.id])

  const toggleStatus = async () => {
    const next = campaign.status === 'active' ? 'paused' : 'active'
    setWorking(true)
    const result = await updateCampaign(campaign.id, { status: next })
    if (result) { setCampaign((c: any) => ({ ...c, status: next })); showToast(next === 'active' ? 'تم تفعيل الحملة' : 'تم إيقاف الحملة') }
    setWorking(false)
  }

  const handleDelete = async () => {
    if (!confirm(`حذف حملة "${campaign.name}" نهائياً؟`)) return
    setWorking(true)
    await deleteCampaign_(campaign.id)
    router.push('/campaigns')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  if (!campaign) return (
    <div className="text-center py-20 text-gray-400">
      <p>الحملة غير موجودة</p>
      <button onClick={() => router.push('/campaigns')} className="btn btn-secondary mt-4">رجوع</button>
    </div>
  )

  const [cls, label] = STATUS_MAP[campaign.status] || ['badge-gray', campaign.status]

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/campaigns')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="page-title">{campaign.name}</h1>
          <p className="text-sm text-gray-400">{campaign.client?.company_name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleStatus} disabled={working}
            className={`btn ${campaign.status === 'active' ? 'btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50' : 'btn-primary'}`}>
            {campaign.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'}
          </button>
          <button onClick={handleDelete} disabled={working} className="btn btn-danger">حذف</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'مرات العرض',    value: stats?.playCount?.toLocaleString('ar') ?? '—', sub: 'إجمالي' },
          { label: 'ساعات التشغيل', value: stats?.totalHours ?? '—',                      sub: 'ساعة فعلية' },
          { label: 'الشاشات',       value: stats?.screenCount ?? '—',                     sub: 'شاشة تعرضها' },
          { label: 'الجداول',       value: stats?.scheduleCount ?? '—',                   sub: 'جدولة نشطة' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Campaign Info */}
        <div className="card p-4">
          <p className="section-title mb-3">تفاصيل الحملة</p>
          {[
            ['الحالة',    <span className={`badge ${cls}`}>{label}</span>],
            ['الفترة',    `${campaign.start_date} – ${campaign.end_date}`],
            ['السعر',     `${Number(campaign.price || 0).toLocaleString('ar')} ريال`],
            ['الأولوية',  campaign.priority === 'high' ? 'عالية' : campaign.priority === 'urgent' ? 'طارئة' : 'عادية'],
            ['العميل',    campaign.client?.company_name || '—'],
          ].map(([k, v]: any) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
          {campaign.notes && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">{campaign.notes}</p>
          )}
        </div>

        {/* Schedules */}
        <div className="card p-4">
          <p className="section-title mb-3">الجدولة ({schedules.length})</p>
          {schedules.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">لا توجد جدولة</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((s: any) => (
                <div key={s.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{s.screen?.name || '—'}</span>
                    <span className="text-gray-400 font-mono">
                      {s.start_time?.substring(0, 5)} – {s.end_time?.substring(0, 5)}
                    </span>
                  </div>
                  {s.screen?.location_name && (
                    <p className="text-gray-400 mb-1">{s.screen.location_name}</p>
                  )}
                  <p className="text-gray-500">
                    {(s.days_of_week || []).map((d: string) => CODE_TO_DAY[d] || d).join('، ')}
                    {' · '}{s.duration_sec} ث/إعلان
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="section-title">المحتوى الإعلاني ({media.length} ملف)</p>
        </div>
        {media.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا يوجد محتوى مرتبط بهذه الحملة</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {media.map((m: any, i: number) => (
              <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="h-20 bg-gray-50 flex items-center justify-center relative">
                  {m.media?.file_type === 'image' && m.media?.file_url ? (
                    <img src={m.media.file_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl">{m.media?.file_type === 'video' ? '🎬' : '🖼️'}</div>
                      <p className="text-xs text-gray-400">{m.media?.duration_sec} ث</p>
                    </div>
                  )}
                  <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-1">{i + 1}</div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 truncate">{m.media?.file_name}</p>
                  <p className="text-xs text-gray-400">{m.media?.file_size_mb} MB</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
