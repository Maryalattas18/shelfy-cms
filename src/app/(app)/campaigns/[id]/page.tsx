'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  getCampaigns, getCampaignMedia, getCampaignSchedules, getMedia, getScreens,
  updateCampaign, deleteCampaign_, createCampaignMedia, updateCampaignMedia,
  updateSchedule, deleteSchedule, createSchedule, uploadMedia
} from '@/lib/supabase'

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const DAY_TO_CODE: Record<string, string> = {
  'السبت': 'sat', 'الأحد': 'sun', 'الاثنين': 'mon',
  'الثلاثاء': 'tue', 'الأربعاء': 'wed', 'الخميس': 'thu', 'الجمعة': 'fri'
}
const CODE_TO_DAY: Record<string, string> = {
  sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء',
  wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت'
}
const STATUS_MAP: Record<string, [string, string]> = {
  active:    ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft:     ['badge-blue',  'مسودة'],
  paused:    ['badge-gray',  'موقوفة'],
  ended:     ['badge-gray',  'منتهية'],
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  return `منذ ${Math.floor(hrs / 24)} يوم`
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

  // ─── Inline name edit ───
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // ─── Edit Schedule Modal ───
  const [schedEditModal, setSchedEditModal] = useState(false)
  const [schedEditId, setSchedEditId] = useState('')
  const [schedFrom, setSchedFrom] = useState('')
  const [schedTo, setSchedTo] = useState('')
  const [schedDur, setSchedDur] = useState('')
  const [schedDays, setSchedDays] = useState<string[]>([])
  const [schedWeight, setSchedWeight] = useState(100)
  const [schedSaving, setSchedSaving] = useState(false)

  // ─── Add Schedule Modal ───
  const [addSchedOpen, setAddSchedOpen] = useState(false)
  const [allScreens, setAllScreens] = useState<any[]>([])
  const [newSchedScreen, setNewSchedScreen] = useState('')
  const [newSchedFrom, setNewSchedFrom] = useState('08:00')
  const [newSchedTo, setNewSchedTo] = useState('22:00')
  const [newSchedDur, setNewSchedDur] = useState('30')
  const [newSchedDays, setNewSchedDays] = useState<string[]>(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'])
  const [newSchedWeight, setNewSchedWeight] = useState(100)
  const [addSchedSaving, setAddSchedSaving] = useState(false)

  // ─── Screens Modal ───
  const [screensOpen, setScreensOpen] = useState(false)

  // ─── Transform Editor ───
  const [transformModal, setTransformModal] = useState<any | null>(null)
  const [tr, setTr] = useState({ x: 0, y: 0, scale: 1, rotate: 0 })
  const [trSaving, setTrSaving] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // ─── Add Media Modal ───
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
    setNameValue(found?.name || '')
    setMedia(cm as any[])
    setSchedules(sc as any[])
    setStats(st)
    setLogs(lg || [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [params.id])

  // ─── Name Edit ───
  const startEditName = () => {
    setNameValue(campaign.name)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  const saveName = async () => {
    if (!nameValue.trim() || nameValue === campaign.name) { setEditingName(false); return }
    await updateCampaign(campaign.id, { name: nameValue.trim() })
    setCampaign((c: any) => ({ ...c, name: nameValue.trim() }))
    setEditingName(false)
    showToast('تم تحديث اسم الحملة')
  }

  // ─── Status Toggle ───
  const toggleStatus = async () => {
    const next = campaign.status === 'active' ? 'paused' : 'active'
    setWorking(true)
    await updateCampaign(campaign.id, { status: next })
    setCampaign((c: any) => ({ ...c, status: next }))
    showToast(next === 'active' ? 'تم تفعيل الحملة' : 'تم إيقاف الحملة')
    setWorking(false)
  }

  const handleDelete = async () => {
    if (!confirm(`حذف حملة "${campaign.name}" نهائياً؟`)) return
    setWorking(true)
    await deleteCampaign_(campaign.id)
    router.push('/campaigns')
  }

  // ─── Delete Campaign Media ───
  const deleteCampaignMediaItem = async (cmId: string) => {
    if (!confirm('حذف هذا المحتوى من الحملة؟')) return
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'campaign_media', id: cmId }),
    })
    setMedia(prev => prev.filter(m => m.id !== cmId))
    showToast('تم حذف المحتوى من الحملة')
  }

  // ─── Edit Schedule ───
  const openSchedEdit = (s: any) => {
    setSchedEditId(s.id)
    setSchedFrom(s.start_time?.substring(0, 5) || '08:00')
    setSchedTo(s.end_time?.substring(0, 5) || '22:00')
    setSchedDur(String(s.duration_sec || 30))
    setSchedDays((s.days_of_week || []).map((c: string) => Object.entries(DAY_TO_CODE).find(([, v]) => v === c)?.[0] || c))
    setSchedWeight(s.weight ?? 100)
    setSchedEditModal(true)
  }

  const saveSchedEdit = async () => {
    if (schedDays.length === 0) return showToast('يرجى اختيار يوم واحد على الأقل')
    setSchedSaving(true)
    await updateSchedule(schedEditId, {
      start_time: schedFrom,
      end_time: schedTo,
      duration_sec: Number(schedDur) || 30,
      days_of_week: schedDays.map(d => DAY_TO_CODE[d]),
      weight: schedWeight,
    })
    setSchedSaving(false)
    setSchedEditModal(false)
    showToast('تم تحديث الجدولة')
    loadAll()
  }

  const delSched = async (id: string) => {
    if (!confirm('حذف هذه الجدولة؟')) return
    await deleteSchedule(id)
    showToast('تم الحذف')
    loadAll()
  }

  // ─── Add Schedule ───
  const openAddSched = async () => {
    const screens = await getScreens() as any[]
    setAllScreens(screens)
    setNewSchedScreen(screens[0]?.id || '')
    setNewSchedFrom('08:00')
    setNewSchedTo('22:00')
    setNewSchedDur('30')
    setNewSchedDays(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'])
    setNewSchedWeight(100)
    setAddSchedOpen(true)
  }

  const submitAddSched = async () => {
    if (!newSchedScreen) return showToast('اختر شاشة')
    if (newSchedDays.length === 0) return showToast('اختر يوم واحد على الأقل')
    setAddSchedSaving(true)
    await createSchedule({
      campaign_id: params.id,
      screen_id: newSchedScreen,
      start_time: newSchedFrom,
      end_time: newSchedTo,
      days_of_week: newSchedDays.map(d => DAY_TO_CODE[d]),
      duration_sec: Number(newSchedDur) || 30,
      weight: newSchedWeight,
    })
    setAddSchedSaving(false)
    setAddSchedOpen(false)
    showToast('تمت إضافة الجدولة')
    loadAll()
  }

  // ─── Screens Modal ───
  const openScreensModal = async () => {
    const screens = await getScreens() as any[]
    setAllScreens(screens)
    setScreensOpen(true)
  }

  const removeScreenFromCampaign = async (screenId: string, screenName: string) => {
    if (!confirm(`إلغاء عرض الحملة على "${screenName}"؟ سيتم حذف جميع جداولها على هذه الشاشة.`)) return
    const schedsToDelete = schedules.filter((s: any) => s.screen_id === screenId || s.screen?.id === screenId)
    await Promise.all(schedsToDelete.map((s: any) => deleteSchedule(s.id)))
    showToast(`تم إلغاء الشاشة "${screenName}"`)
    loadAll()
  }

  // ─── Transform ───
  const openTransform = (m: any) => {
    const saved = m.transform || { x: 0, y: 0, scale: 1, rotate: 0 }
    setTr({ x: saved.x ?? 0, y: saved.y ?? 0, scale: saved.scale ?? 1, rotate: saved.rotate ?? 0 })
    setTransformModal(m)
  }

  const saveTransform = async () => {
    if (!transformModal) return
    setTrSaving(true)
    setMedia(prev => prev.map(m => m.id === transformModal.id ? { ...m, transform: tr } : m))
    await updateCampaignMedia(transformModal.id, { transform: tr } as any)
    setTrSaving(false)
    setTransformModal(null)
    showToast('تم حفظ التعديلات')
  }

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragRef.current = { startX: clientX, startY: clientY, initX: tr.x, initY: tr.y }
  }
  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current || !previewRef.current) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const { width, height } = previewRef.current.getBoundingClientRect()
    const dx = ((clientX - dragRef.current.startX) / width) * 100
    const dy = ((clientY - dragRef.current.startY) / height) * 100
    setTr(t => ({ ...t, x: Math.max(-50, Math.min(50, dragRef.current!.initX + dx)), y: Math.max(-50, Math.min(50, dragRef.current!.initY + dy)) }))
  }
  const onDragEnd = () => { dragRef.current = null }

  // ─── Add Media ───
  const openAddMedia = async () => {
    const all = await getMedia() as any[]
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
    if (uploadFile) {
      const uploaded = await uploadMedia(uploadFile, campaign.client_id)
      if (uploaded) { newIds.push(uploaded.id); uploadedNames.push(uploadFile.name) }
    }
    if (newIds.length > 0) {
      await createCampaignMedia(params.id, newIds)
      await fetch('/api/campaign-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: params.id,
          action: 'media_added',
          details: { count: newIds.length, files: [...allMedia.filter((m: any) => selectedNewMedia.includes(m.id)).map((m: any) => m.file_name), ...uploadedNames] },
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

  // الشاشات الفريدة من الجداول
  const uniqueScreens = Array.from(
    new Map(schedules.map((s: any) => [s.screen?.id, s.screen]).filter(([id]) => id)).values()
  )

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/campaigns')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
              className="page-title bg-transparent border-b-2 border-primary outline-none w-full"
              style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
            />
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditName}>
              <h1 className="page-title truncate">{campaign.name}</h1>
              <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
          )}
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
          { label: 'مرات العرض',    value: stats?.playCount?.toLocaleString('ar') ?? '—', sub: 'إجمالي', onClick: undefined },
          { label: 'ساعات التشغيل', value: stats?.totalHours ?? '—', sub: 'ساعة فعلية', onClick: undefined },
          { label: 'الشاشات',       value: uniqueScreens.length || stats?.screenCount || '—', sub: 'شاشة تعرضها', onClick: openScreensModal },
          { label: 'الجداول',       value: schedules.length || stats?.scheduleCount || '—', sub: 'جدولة نشطة', onClick: undefined },
        ].map(s => (
          <div key={s.label}
            className={`stat-card ${s.onClick ? 'cursor-pointer hover:border-primary hover:border transition-all' : ''}`}
            onClick={s.onClick}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            {s.onClick && <p className="text-xs text-primary mt-1">اضغط للعرض</p>}
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
          <div className="flex justify-between items-center mb-3">
            <p className="section-title">الجدولة ({schedules.length})</p>
            <button onClick={openAddSched}
              className="btn btn-primary btn-sm flex items-center gap-1">
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة
            </button>
          </div>
          {schedules.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">لا توجد جدولة — اضغط إضافة</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((s: any) => (
                <div key={s.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{s.screen?.name || '—'}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 font-mono">{s.start_time?.substring(0, 5)} – {s.end_time?.substring(0, 5)}</span>
                      <button onClick={() => openSchedEdit(s)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => delSched(s.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  {s.screen?.location_name && <p className="text-gray-400 mb-1">{s.screen.location_name}</p>}
                  <p className="text-gray-500">
                    {(s.days_of_week || []).map((d: string) => CODE_TO_DAY[d] || d).join('، ')}
                    {' · '}{s.duration_sec} ث/إعلان{s.weight && s.weight !== 100 ? ` · ${s.weight}%` : ''}
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
          <button onClick={openAddMedia} className="btn btn-primary btn-sm flex items-center gap-1">
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            إضافة محتوى
          </button>
        </div>
        {media.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا يوجد محتوى مرتبط بهذه الحملة</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {media.map((m: any, i: number) => {
              const fitMode = m.fit_mode || 'cover'
              const objPos = m.object_position || 'center center'
              return (
                <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden group relative">
                  {/* Delete button */}
                  <button
                    onClick={() => deleteCampaignMediaItem(m.id)}
                    className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-black bg-opacity-60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="حذف من الحملة">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>

                  {/* Thumbnail */}
                  <div className="h-24 bg-gray-50 flex items-center justify-center relative">
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
                    <button onClick={() => openTransform(m)}
                      className="w-full mt-1 text-xs py-1 rounded border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all">
                      تعديل المظهر ✏️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="section-title">سجل التعديلات</p>
          </div>
          <div className="p-4 space-y-3">
            {logs.map((log: any) => {
              const d = log.details || {}
              let text = log.action === 'media_added'
                ? `تمت إضافة ${d.count} ${d.count === 1 ? 'ملف' : 'ملفات'} على المحتوى${d.files?.length ? `: ${d.files.join('، ')}` : ''}`
                : log.action
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

      {/* ─── Screens Modal ─── */}
      {screensOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setScreensOpen(false) }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">الشاشات المرتبطة ({uniqueScreens.length})</span>
              <button onClick={() => setScreensOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20 }}>×</button>
            </div>
            {uniqueScreens.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">لا توجد شاشات مرتبطة بعد</p>
            ) : (
              <div className="space-y-2 mb-4">
                {uniqueScreens.map((screen: any) => {
                  const screenScheds = schedules.filter((s: any) => s.screen?.id === screen.id)
                  return (
                    <div key={screen.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{screen.name}</p>
                        <p className="text-xs text-gray-400">{screen.location_name || '—'} · {screenScheds.length} جدولة</p>
                      </div>
                      <button
                        onClick={() => { removeScreenFromCampaign(screen.id, screen.name); setScreensOpen(false) }}
                        className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-all">
                        إلغاء
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <button
              onClick={() => { setScreensOpen(false); openAddSched() }}
              className="btn btn-primary w-full flex items-center justify-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة شاشة جديدة
            </button>
          </div>
        </div>
      )}

      {/* ─── Add Schedule Modal ─── */}
      {addSchedOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddSchedOpen(false) }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">إضافة جدولة جديدة</span>
              <button onClick={() => setAddSchedOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20 }}>×</button>
            </div>

            <div className="mb-3">
              <label className="label">الشاشة</label>
              <select className="input w-full" value={newSchedScreen} onChange={e => setNewSchedScreen(e.target.value)}>
                {allScreens.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}{s.location_name ? ` — ${s.location_name}` : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="label">من الساعة</label><input className="input" type="time" value={newSchedFrom} onChange={e => setNewSchedFrom(e.target.value)} /></div>
              <div><label className="label">إلى الساعة</label><input className="input" type="time" value={newSchedTo} onChange={e => setNewSchedTo(e.target.value)} /></div>
            </div>

            <div className="mb-3">
              <label className="label">مدة كل إعلان (ثانية)</label>
              <input className="input w-full" type="number" min="5" max="300" value={newSchedDur} onChange={e => setNewSchedDur(e.target.value)} />
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <label className="label">نسبة الظهور</label>
                <span className="text-sm font-bold text-primary">{newSchedWeight}%</span>
              </div>
              <input type="range" min="10" max="100" step="5" value={newSchedWeight}
                onChange={e => setNewSchedWeight(Number(e.target.value))}
                className="w-full accent-primary" />
            </div>

            <div className="mb-5">
              <label className="label">أيام العرض</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS.map(d => (
                  <span key={d}
                    onClick={() => setNewSchedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                    className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border select-none
                      ${newSchedDays.includes(d) ? 'bg-primary-light text-primary border-primary font-medium' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setAddSchedOpen(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={submitAddSched} disabled={addSchedSaving}>
                {addSchedSaving ? 'جاري الحفظ...' : 'إضافة الجدولة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Schedule Modal ─── */}
      {schedEditModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSchedEditModal(false) }}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">تعديل الجدولة</span>
              <button onClick={() => setSchedEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20 }}>×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="label">من الساعة</label><input className="input" type="time" value={schedFrom} onChange={e => setSchedFrom(e.target.value)} /></div>
              <div><label className="label">إلى الساعة</label><input className="input" type="time" value={schedTo} onChange={e => setSchedTo(e.target.value)} /></div>
            </div>
            <div className="mb-3">
              <label className="label">مدة كل إعلان (ثانية)</label>
              <input className="input w-full" type="number" min="5" max="300" value={schedDur} onChange={e => setSchedDur(e.target.value)} />
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <label className="label">نسبة الظهور</label>
                <span className="text-sm font-bold text-primary">{schedWeight}%</span>
              </div>
              <input type="range" min="10" max="100" step="5" value={schedWeight}
                onChange={e => setSchedWeight(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div className="mb-5">
              <label className="label">أيام العرض</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS.map(d => (
                  <span key={d} onClick={() => setSchedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                    className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border select-none
                      ${schedDays.includes(d) ? 'bg-primary-light text-primary border-primary font-medium' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setSchedEditModal(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={saveSchedEdit} disabled={schedSaving}>
                {schedSaving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Transform Editor Modal ─── */}
      {transformModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setTransformModal(null) }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">تعديل مظهر الإعلان</span>
              <button onClick={() => setTransformModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20 }}>×</button>
            </div>
            <div ref={previewRef}
              onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
              onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
              style={{ width: '100%', height: 220, background: '#111', borderRadius: 12, overflow: 'hidden', position: 'relative', cursor: 'grab', marginBottom: 16, userSelect: 'none' }}>
              {transformModal.media?.file_type === 'image' ? (
                <img src={transformModal.media.file_url} alt="" style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%', objectFit: 'cover', transform: `translate(calc(-50% + ${tr.x}%), calc(-50% + ${tr.y}%)) scale(${tr.scale}) rotate(${tr.rotate}deg)`, transformOrigin: 'center center', pointerEvents: 'none' }} />
              ) : (
                <video src={transformModal.media?.file_url} muted style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%', objectFit: 'cover', transform: `translate(calc(-50% + ${tr.x}%), calc(-50% + ${tr.y}%)) scale(${tr.scale}) rotate(${tr.rotate}deg)`, transformOrigin: 'center center', pointerEvents: 'none' }} />
              )}
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>اسحب لتحريك الصورة</div>
            </div>
            {/* أزرار سريعة */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { label: '↕ عمودي', rotate: 90, scale: tr.scale },
                { label: '↔ أفقي',  rotate: 0,  scale: tr.scale },
              ].map(p => (
                <button key={p.label} onClick={() => setTr(t => ({ ...t, rotate: p.rotate }))}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    border: `1px solid ${tr.rotate === p.rotate ? '#378ADD' : '#e5e7eb'}`,
                    background: tr.rotate === p.rotate ? '#e6f1fb' : '#f9f9f7',
                    color: tr.rotate === p.rotate ? '#378ADD' : '#666',
                    fontWeight: tr.rotate === p.rotate ? 600 : 400,
                  }}>
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#555' }}>الحجم (تصغير / تكبير)</span>
                <span style={{ fontSize: 12, color: '#378ADD', fontWeight: 600 }}>{tr.scale.toFixed(2)}x</span>
              </div>
              <input type="range" min="0.2" max="4" step="0.05" value={tr.scale} onChange={e => setTr(t => ({ ...t, scale: parseFloat(e.target.value) }))} style={{ width: '100%', accentColor: '#378ADD' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {[0.3, 0.5, 0.75, 1, 2].map(s => (
                  <button key={s} onClick={() => setTr(t => ({ ...t, scale: s }))}
                    style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: tr.scale === s ? '#e6f1fb' : '#f9f9f7', color: tr.scale === s ? '#378ADD' : '#888', cursor: 'pointer' }}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#555' }}>تدوير دقيق</span>
                <span style={{ fontSize: 12, color: '#378ADD', fontWeight: 600 }}>{tr.rotate}°</span>
              </div>
              <input type="range" min="-180" max="180" step="1" value={tr.rotate} onChange={e => setTr(t => ({ ...t, rotate: parseInt(e.target.value) }))} style={{ width: '100%', accentColor: '#378ADD' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTr({ x: 0, y: 0, scale: 1, rotate: 0 })} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9f9f7', color: '#888', fontSize: 13, cursor: 'pointer' }}>إعادة تعيين</button>
              <button onClick={() => setTransformModal(null)} className="btn btn-secondary flex-1">إلغاء</button>
              <button onClick={saveTransform} disabled={trSaving} className="btn btn-primary flex-1">{trSaving ? 'جاري الحفظ...' : 'حفظ'}</button>
            </div>
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
            {allMedia.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>اختر من مكتبة العميل</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {allMedia.map((m: any) => {
                    const sel = selectedNewMedia.includes(m.id)
                    return (
                      <div key={m.id} onClick={() => setSelectedNewMedia(s => sel ? s.filter(x => x !== m.id) : [...s, m.id])}
                        style={{ border: `2px solid ${sel ? '#378ADD' : '#e5e7eb'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: sel ? '#e6f1fb' : 'white', transition: 'border-color 0.12s' }}>
                        <div style={{ height: 56, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {m.file_type === 'image' && m.file_url ? <img src={m.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🎬</span>}
                        </div>
                        <p style={{ fontSize: 10, color: '#555', padding: '4px 6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.file_name}</p>
                      </div>
                    )
                  })}
                </div>
                {selectedNewMedia.length > 0 && <p style={{ fontSize: 11, color: '#378ADD', marginTop: 6 }}>تم تحديد {selectedNewMedia.length} ملف</p>}
              </div>
            )}
            {allMedia.length === 0 && <p style={{ fontSize: 13, color: '#aaa', marginBottom: 12, textAlign: 'center' }}>لا يوجد محتوى آخر لهذا العميل في المكتبة</p>}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>أو ارفع ملفاً جديداً</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, border: '2px dashed #e0e0dc', borderRadius: 10, padding: '12px 16px', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" width="18" height="18"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                <span style={{ fontSize: 12, color: uploadFile ? '#378ADD' : '#aaa' }}>{uploadFile ? uploadFile.name : 'اضغط لاختيار صورة أو فيديو'}</span>
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setAddMediaOpen(false)} className="btn btn-secondary">إلغاء</button>
              <button onClick={submitAddMedia} disabled={addingMedia || (selectedNewMedia.length === 0 && !uploadFile)} className="btn btn-primary">
                {addingMedia ? 'جاري الإضافة...' : `إضافة${selectedNewMedia.length > 0 ? ` (${selectedNewMedia.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
