'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCampaigns, getCampaignMedia, getCampaignSchedules, getMedia, updateCampaign, deleteCampaign_, createCampaignMedia, updateCampaignMedia, uploadMedia } from '@/lib/supabase'

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

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  const days = Math.floor(hrs / 24)
  return `منذ ${days} يوم`
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [media, setMedia] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [toast, setToast] = useState('')

  // ─── Add Media Modal ───
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null)
  const [addMediaOpen, setAddMediaOpen] = useState(false)
  const [allMedia, setAllMedia] = useState<any[]>([])
  const [selectedNewMedia, setSelectedNewMedia] = useState<string[]>([])
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [addingMedia, setAddingMedia] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadAll = async () => {
    const [allCamps, cm, sc, st, lg] = await Promise.all([
      getCampaigns(),
      getCampaignMedia(params.id),
      getCampaignSchedules(params.id),
      fetch(`/api/stats?type=campaign&id=${params.id}`).then(r => r.json()),
      fetch(`/api/campaign-logs?campaignId=${params.id}`).then(r => r.json()).catch(() => []),
    ])
    const found = (allCamps as any[]).find(c => c.id === params.id)
    setCampaign(found || null)
    setMedia(cm as any[])
    setSchedules(sc as any[])
    setStats(st)
    setLogs(lg || [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [params.id])

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

  const updateMediaSetting = async (id: string, key: 'fit_mode' | 'object_position', value: string) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, [key]: value } : m))
    await updateCampaignMedia(id, { [key]: value })
  }

  const openAddMedia = async () => {
    const all = await getMedia() as any[]
    // استثنِ المحتوى المضاف مسبقاً
    const existingIds = new Set(media.map((m: any) => m.media_id || m.media?.id))
    const clientMedia = all.filter((m: any) => m.client_id === campaign.client_id && !existingIds.has(m.id))
    setAllMedia(clientMedia)
    setSelectedNewMedia([])
    setUploadFile(null)
    setAddMediaOpen(true)
  }

  const submitAddMedia = async () => {
    if (selectedNewMedia.length === 0 && !uploadFile) return
    setAddingMedia(true)

    let newIds = [...selectedNewMedia]
    let uploadedNames: string[] = []

    // رفع ملف جديد إذا وُجد
    if (uploadFile) {
      const uploaded = await uploadMedia(uploadFile, campaign.client_id)
      if (uploaded) {
        newIds.push(uploaded.id)
        uploadedNames.push(uploadFile.name)
      }
    }

    // ربط بالحملة
    if (newIds.length > 0) {
      await createCampaignMedia(params.id, newIds)

      // أسماء الملفات المحددة
      const selectedNames = allMedia
        .filter((m: any) => selectedNewMedia.includes(m.id))
        .map((m: any) => m.file_name)
      const allNames = [...selectedNames, ...uploadedNames]

      // تسجيل في سجل النشاط
      await fetch('/api/campaign-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: params.id,
          action: 'media_added',
          details: { count: newIds.length, files: allNames },
        }),
      })

      showToast(`تمت إضافة ${newIds.length} ملف للحملة`)
      setAddMediaOpen(false)
      loadAll()
    }
    setAddingMedia(false)
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
      <div className="card mb-5">
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
          <p className="section-title">المحتوى الإعلاني ({media.length} ملف)</p>
          <button onClick={openAddMedia} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            إضافة محتوى
          </button>
        </div>
        {media.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا يوجد محتوى مرتبط بهذه الحملة</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {media.map((m: any, i: number) => {
              const isExpanded = expandedMedia === m.id
              const fitMode = m.fit_mode || 'cover'
              const objPos = m.object_position || 'center center'
              const positions = [
                ['right top','center top','left top'],
                ['right center','center center','left center'],
                ['right bottom','center bottom','left bottom'],
              ]
              return (
                <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Thumbnail */}
                  <div
                    className="h-24 bg-gray-50 flex items-center justify-center relative cursor-pointer"
                    onClick={() => setExpandedMedia(isExpanded ? null : m.id)}>
                    {m.media?.file_type === 'image' && m.media?.file_url ? (
                      <img src={m.media.file_url} alt="" className="w-full h-full"
                        style={{ objectFit: fitMode as any, objectPosition: objPos }} />
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl">{m.media?.file_type === 'video' ? '🎬' : '🖼️'}</div>
                        <p className="text-xs text-gray-400">{m.media?.duration_sec} ث</p>
                      </div>
                    )}
                    <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-1">{i + 1}</div>
                    <div className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-40 rounded px-1">
                      {fitMode === 'cover' ? 'تعبئة' : fitMode === 'contain' ? 'احتواء' : 'مد'}
                    </div>
                  </div>

                  <div className="p-2">
                    <p className="text-xs text-gray-700 truncate mb-1">{m.media?.file_name}</p>

                    {/* Controls */}
                    {isExpanded && (
                      <div className="mt-2 space-y-2 border-t border-gray-50 pt-2">
                        {/* Fit Mode */}
                        <div className="flex gap-1">
                          {[['cover','تعبئة'],['contain','احتواء'],['fill','مد']].map(([v, ar]) => (
                            <button key={v} onClick={() => updateMediaSetting(m.id, 'fit_mode', v)}
                              className={`flex-1 text-xs py-1 rounded border transition-all
                                ${fitMode === v ? 'bg-primary-light text-primary border-primary' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                              {ar}
                            </button>
                          ))}
                        </div>

                        {/* Position Grid — يظهر فقط عند cover */}
                        {fitMode === 'cover' && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">موضع الصورة</p>
                            <div className="grid grid-cols-3 gap-0.5" style={{ width: 66 }}>
                              {positions.map((row, ri) => row.map((pos, ci) => (
                                <button key={pos} onClick={() => updateMediaSetting(m.id, 'object_position', pos)}
                                  style={{ width: 20, height: 20, borderRadius: 3, border: '1.5px solid', transition: 'all 0.1s',
                                    borderColor: objPos === pos ? '#378ADD' : '#e5e7eb',
                                    background: objPos === pos ? '#e6f1fb' : '#f9f9f7' }}
                                />
                              )))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Activity Log ─── */}
      {logs.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="section-title">سجل التعديلات</p>
          </div>
          <div className="p-4 space-y-3">
            {logs.map((log: any) => {
              const d = log.details || {}
              let text = ''
              if (log.action === 'media_added') {
                text = `تمت إضافة ${d.count} ${d.count === 1 ? 'ملف' : 'ملفات'} على المحتوى`
                if (d.files?.length) text += `: ${d.files.join('، ')}`
              } else {
                text = log.action
              }
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg viewBox="0 0 20 20" fill="#378ADD" width="13" height="13">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{text}</p>
                    <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{timeAgo(log.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Add Media Modal ─── */}
      {addMediaOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddMediaOpen(false) }}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <span className="modal-title">إضافة محتوى للحملة</span>
              <button onClick={() => setAddMediaOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {/* اختيار من المكتبة */}
            {allMedia.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>اختر من مكتبة العميل</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {allMedia.map((m: any) => {
                    const sel = selectedNewMedia.includes(m.id)
                    return (
                      <div key={m.id} onClick={() => setSelectedNewMedia(s => sel ? s.filter(x => x !== m.id) : [...s, m.id])}
                        style={{
                          border: `2px solid ${sel ? '#378ADD' : '#e5e7eb'}`,
                          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                          background: sel ? '#e6f1fb' : 'white',
                          transition: 'border-color 0.12s',
                        }}>
                        <div style={{ height: 56, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {m.file_type === 'image' && m.file_url
                            ? <img src={m.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 20 }}>🎬</span>
                          }
                        </div>
                        <p style={{ fontSize: 10, color: '#555', padding: '4px 6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                      </div>
                    )
                  })}
                </div>
                {selectedNewMedia.length > 0 && (
                  <p style={{ fontSize: 11, color: '#378ADD', marginTop: 6 }}>تم تحديد {selectedNewMedia.length} ملف</p>
                )}
              </div>
            )}

            {allMedia.length === 0 && (
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 12, textAlign: 'center' }}>لا يوجد محتوى آخر لهذا العميل في المكتبة</p>
            )}

            {/* رفع ملف جديد */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>أو ارفع ملفاً جديداً</p>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: '2px dashed #e0e0dc', borderRadius: 10, padding: '12px 16px',
                cursor: 'pointer', transition: 'border-color 0.12s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#378ADD')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e0e0dc')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" width="18" height="18">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span style={{ fontSize: 12, color: uploadFile ? '#378ADD' : '#aaa' }}>
                  {uploadFile ? uploadFile.name : 'اضغط لاختيار صورة أو فيديو'}
                </span>
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }}
                  onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setAddMediaOpen(false)} className="btn btn-secondary">إلغاء</button>
              <button
                onClick={submitAddMedia}
                disabled={addingMedia || (selectedNewMedia.length === 0 && !uploadFile)}
                className="btn btn-primary"
              >
                {addingMedia ? 'جاري الإضافة...' : `إضافة${selectedNewMedia.length > 0 ? ` (${selectedNewMedia.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
