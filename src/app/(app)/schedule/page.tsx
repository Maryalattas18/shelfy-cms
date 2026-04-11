'use client'
import { useState, useEffect } from 'react'
import { getCampaigns, getScreens, getSchedules, createSchedule, deleteSchedule, updateSchedule } from '@/lib/supabase'

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const DAY_TO_CODE: Record<string, string> = {
  'السبت': 'sat', 'الأحد': 'sun', 'الاثنين': 'mon',
  'الثلاثاء': 'tue', 'الأربعاء': 'wed', 'الخميس': 'thu', 'الجمعة': 'fri'
}
const CODE_TO_DAY: Record<string, string> = Object.fromEntries(
  Object.entries(DAY_TO_CODE).map(([ar, en]) => [en, ar])
)

const STATUS_MAP: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  draft: ['badge-blue', 'مسودة'],
  paused: ['badge-gray', 'موقوفة'],
  ended: ['badge-gray', 'منتهية'],
}

export default function SchedulePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [screens, setScreens] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: 'success' })

  // New schedule form
  const [campId, setCampId] = useState('')
  const [screenId, setScreenId] = useState('')
  const [from, setFrom] = useState('08:00')
  const [to, setTo] = useState('22:00')
  const [dur, setDur] = useState('30')
  const [selDays, setSelDays] = useState(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'])

  // Edit modal
  const [editModal, setEditModal] = useState(false)
  const [editId, setEditId] = useState('')
  const [editFrom, setEditFrom] = useState('')
  const [editTo, setEditTo] = useState('')
  const [editDur, setEditDur] = useState('')
  const [editDays, setEditDays] = useState<string[]>([])

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }

  const load = async () => {
    setLoading(true)
    const [c, s, sc] = await Promise.all([getCampaigns(), getScreens(), getSchedules()])
    setCampaigns(c as any[])
    setScreens(s as any[])
    setSchedules(sc as any[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleDay = (d: string) =>
    setSelDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const toggleEditDay = (d: string) =>
    setEditDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const save = async () => {
    if (!campId || !screenId) return alert('يرجى اختيار الحملة والشاشة')
    if (selDays.length === 0) return alert('يرجى اختيار يوم واحد على الأقل')
    if (from >= to) return alert('وقت البداية يجب أن يكون قبل وقت النهاية')

    setSaving(true)
    const result = await createSchedule({
      campaign_id: campId,
      screen_id: screenId,
      start_time: from,
      end_time: to,
      days_of_week: selDays.map(d => DAY_TO_CODE[d]),
      duration_sec: Number(dur) || 30,
    })
    setSaving(false)

    if (!result) return showToast('حدث خطأ في الحفظ', 'error')

    showToast('تم حفظ الجدولة بنجاح')
    setCampId(''); setScreenId('')
    setSelDays(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'])
    await load()
  }

  const openEdit = (s: any) => {
    setEditId(s.id)
    setEditFrom(s.start_time?.substring(0, 5) || '08:00')
    setEditTo(s.end_time?.substring(0, 5) || '22:00')
    setEditDur(String(s.duration_sec || 30))
    setEditDays((s.days_of_week || []).map((c: string) => CODE_TO_DAY[c] || c))
    setEditModal(true)
  }

  const saveEdit = async () => {
    if (editDays.length === 0) return showToast('يرجى اختيار يوم واحد على الأقل', 'error')
    if (editFrom >= editTo) return showToast('وقت البداية يجب أن يكون قبل وقت النهاية', 'error')
    setSaving(true)
    await updateSchedule(editId, {
      start_time: editFrom,
      end_time: editTo,
      duration_sec: Number(editDur) || 30,
      days_of_week: editDays.map(d => DAY_TO_CODE[d]),
    })
    setSaving(false)
    setEditModal(false)
    showToast('تم تحديث الجدولة')
    await load()
  }

  const del = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الجدولة؟')) return
    await deleteSchedule(id)
    showToast('تم الحذف')
    await load()
  }

  return (
    <div>
      {toast.msg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 text-white px-4 py-2 rounded-lg text-sm z-50 shadow
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* ─── Edit Modal ────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">تعديل الجدولة</h3>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">من الساعة</label>
                <input className="input" type="time" value={editFrom} onChange={e => setEditFrom(e.target.value)} />
              </div>
              <div>
                <label className="label">إلى الساعة</label>
                <input className="input" type="time" value={editTo} onChange={e => setEditTo(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="label">مدة كل إعلان (ثانية)</label>
              <input className="input w-full" type="number" min="5" max="300" value={editDur} onChange={e => setEditDur(e.target.value)} />
            </div>

            <div className="mb-5">
              <label className="label">أيام العرض</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS.map(d => (
                  <span key={d} onClick={() => toggleEditDay(d)}
                    className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border select-none
                      ${editDays.includes(d)
                        ? 'bg-primary-light text-primary border-primary font-medium'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setEditModal(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={saveEdit} disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ التعديل'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">الجدولة</h1>
        <span className="text-xs text-gray-400">{schedules.length} جدولة نشطة</span>
      </div>

      {/* ─── Add Schedule Form ─────────────────────── */}
      <div className="card p-4 mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">جدولة جديدة</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="label">الحملة *</label>
            <select className="input" value={campId} onChange={e => setCampId(e.target.value)}>
              <option value="">— اختر —</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الشاشة *</label>
            <select className="input" value={screenId} onChange={e => setScreenId(e.target.value)}>
              <option value="">— اختر —</option>
              {screens.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.location_name ? ` — ${s.location_name}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">من الساعة</label>
            <input className="input" type="time" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">إلى الساعة</label>
            <input className="input" type="time" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <label className="label">مدة كل إعلان (ثانية)</label>
          <input className="input w-32" type="number" min="5" max="300" value={dur} onChange={e => setDur(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="label">أيام العرض</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {DAYS.map(d => (
              <span key={d} onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border select-none
                  ${selDays.includes(d)
                    ? 'bg-primary-light text-primary border-primary font-medium'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                {d}
              </span>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ الجدولة'}
        </button>
      </div>

      {/* ─── Schedules Table ───────────────────────── */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
          <p className="section-title">الجدولة الحالية</p>
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />}
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="th">الحملة</th>
              <th className="th">الشاشة</th>
              <th className="th">الوقت</th>
              <th className="th">الأيام</th>
              <th className="th">المدة</th>
              <th className="th">الحالة</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && schedules.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                  لا توجد جدولة — أضف جدولة جديدة أعلاه
                </td>
              </tr>
            )}
            {schedules.map((s: any) => {
              const arabicDays = (s.days_of_week || [])
                .map((code: string) => CODE_TO_DAY[code] || code)
                .join('، ')
              const [cls, label] = STATUS_MAP[s.campaign?.status] || ['badge-gray', s.campaign?.status || '—']
              const startTime = s.start_time?.substring(0, 5) || '—'
              const endTime = s.end_time?.substring(0, 5) || '—'

              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="td font-medium">{s.campaign?.name || '—'}</td>
                  <td className="td text-gray-600">
                    {s.screen?.name || '—'}
                    {s.screen?.location_name && (
                      <span className="text-xs text-gray-400 block">{s.screen.location_name}</span>
                    )}
                  </td>
                  <td className="td text-gray-600 font-mono text-xs">{startTime} – {endTime}</td>
                  <td className="td text-gray-600 text-xs max-w-xs">{arabicDays}</td>
                  <td className="td text-gray-600">{s.duration_sec} ث</td>
                  <td className="td">
                    <span className={`badge ${cls}`}>{label}</span>
                  </td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => del(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
