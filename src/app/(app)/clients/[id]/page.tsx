'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getClients, getCampaigns, updateClient } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_BADGE: Record<string, [string, string]> = {
  active:    ['badge-green', 'نشطة'],
  draft:     ['badge-blue', 'مسودة'],
  scheduled: ['badge-amber', 'مجدولة'],
  ended:     ['badge-gray', 'منتهية'],
  paused:    ['badge-amber', 'موقوفة'],
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [client, setClient] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ company_name: '', type: 'brand', email: '', phone: '', website: '', internal_notes: '' })

  const load = async () => {
    const [clients, camps] = await Promise.all([getClients(), getCampaigns()])
    const found = (clients as any[]).find(c => c.id === params.id)
    setClient(found || null)
    setForm({
      company_name: found?.company_name || '',
      type: found?.type || 'brand',
      email: found?.email || '',
      phone: found?.phone || '',
      website: found?.website || '',
      internal_notes: found?.internal_notes || '',
    })
    setCampaigns((camps as any[]).filter(c => c.client_id === params.id))
    setLoading(false)
  }

  useEffect(() => { load() }, [params.id])

  const saveEdit = async () => {
    setSaving(true)
    await updateClient(params.id, form)
    await load()
    setEditMode(false)
    setSaving(false)
    showToast('تم حفظ البروفايل')
  }

  const uploadLogo = async (file: File) => {
    setLogoUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('clientId', params.id)
    fd.append('purpose', 'logo')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.url) {
      setClient((c: any) => ({ ...c, logo_url: json.url }))
      showToast('تم رفع اللوغو')
    }
    setLogoUploading(false)
  }

  const [pwModal, setPwModal] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const setPassword = async () => {
    if (!newPw || newPw.length < 6) return showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    setPwSaving(true)
    const res = await fetch('/api/auth/set-client-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: params.id, password: newPw }),
    })
    setPwSaving(false)
    if (res.ok) { setPwModal(false); setNewPw(''); showToast('تم تعيين كلمة المرور') }
    else showToast('حدث خطأ — حاول مرة ثانية')
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  if (!client) return (
    <div className="text-center py-20 text-gray-400">
      <p>العميل غير موجود</p>
      <button onClick={() => router.push('/clients')} className="btn btn-secondary mt-4">رجوع</button>
    </div>
  )

  const totalRevenue = campaigns.reduce((s, c) => s + Number(c.price || 0), 0)
  const activeCamps = campaigns.filter(c => c.status === 'active').length
  const initials = client.company_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">
          {toast}
        </div>
      )}

      {/* ─── Top Nav ─────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/clients')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title flex-1">بروفايل العميل</h1>
        <div className="flex gap-2">
          <button onClick={() => setPwModal(true)} className="btn btn-secondary btn-sm">🔑 كلمة المرور</button>
          <Link href={`/clients/${client.id}/invoice`} className="btn btn-secondary btn-sm">🖨 فاتورة</Link>
          <Link href={`/campaigns/new?clientId=${client.id}`} className="btn btn-primary btn-sm">+ حملة جديدة</Link>
        </div>
      </div>

      {/* ─── Password Modal ──────────────────────── */}
      {pwModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">تعيين كلمة مرور العميل</h3>
              <button onClick={() => setPwModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">سيستخدم <strong>{client.company_name}</strong> هذه الكلمة لتسجيل الدخول لبوابته</p>
            <label className="label">كلمة المرور الجديدة</label>
            <input type="password" className="input mb-4" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="6 أحرف على الأقل" autoFocus />
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setPwModal(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={setPassword} disabled={pwSaving}>
                {pwSaving ? 'جاري الحفظ...' : 'تعيين كلمة المرور'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Profile Card ────────────────────────── */}
      <div className="card mb-5 overflow-visible">
        {/* غطاء علوي */}
        <div style={{ height: 80, background: 'linear-gradient(135deg, #185FA5, #378ADD, #5fa8e8)', borderRadius: '14px 14px 0 0' }} />

        <div className="px-6 pb-6">
          {/* أفاتار + أزرار */}
          <div className="flex justify-between items-end -mt-10 mb-4">
            {/* اللوغو */}
            <div className="relative">
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 76, height: 76,
                  borderRadius: 18,
                  border: '3px solid white',
                  background: client.logo_url ? 'transparent' : '#378ADD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  position: 'relative',
                }}
                title="انقر لتغيير اللوغو"
              >
                {logoUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                ) : client.logo_url ? (
                  <img src={client.logo_url} alt={client.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{initials}</span>
                )}
                {/* hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <svg viewBox="0 0 20 20" fill="white" width="20" height="20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            </div>

            {/* زر التعديل */}
            <button onClick={() => setEditMode(m => !m)} className={`btn btn-sm ${editMode ? 'btn-secondary' : 'btn-secondary'}`}>
              {editMode ? 'إلغاء' : '✏️ تعديل البروفايل'}
            </button>
          </div>

          {/* معلومات أساسية */}
          {!editMode ? (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{client.company_name}</h2>
                <span className={`badge ${client.type === 'brand' ? 'badge-blue' : 'badge-teal'}`}>
                  {client.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                {client.email && <span>✉️ {client.email}</span>}
                {client.phone && <span>📞 {client.phone}</span>}
                {client.website && <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🌐 {client.website}</a>}
                <span>📅 انضم {new Date(client.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}</span>
              </div>
              {client.internal_notes && (
                <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#78350f' }}>
                  📝 {client.internal_notes}
                </div>
              )}
            </div>
          ) : (
            /* فورم التعديل */
            <div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="label">اسم الشركة</label>
                  <input className="input" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
                <div><label className="label">النوع</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="brand">شركة منتجات</option>
                    <option value="minimarket">ميني ماركت</option>
                  </select></div>
                <div><label className="label">البريد</label>
                  <input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><label className="label">الهاتف</label>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="col-span-2"><label className="label">الموقع الإلكتروني</label>
                  <input className="input" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></div>
                <div className="col-span-2"><label className="label">ملاحظات داخلية</label>
                  <textarea className="input" rows={2} value={form.internal_notes} onChange={e => setForm(f => ({ ...f, internal_notes: e.target.value }))} placeholder="ملاحظات للفريق الداخلي فقط..." /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>إلغاء</button>
                <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stats Row ───────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'إجمالي الإنفاق',  value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`, color: '#22c55e' },
          { label: 'الحملات الكلية',  value: campaigns.length,                              color: '#378ADD' },
          { label: 'حملات نشطة',      value: activeCamps,                                   color: '#f59e0b' },
          { label: 'الرصيد',          value: `${Number(client.balance || 0).toLocaleString('ar-SA')} ر.س`, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, marginBottom: 8 }} />
            <p style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Campaigns Table ─────────────────────── */}
      <div className="card">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
          <p className="section-title">الحملات الإعلانية</p>
          <Link href={`/campaigns/new?clientId=${client.id}`} className="text-xs text-blue-500 hover:underline">+ إضافة حملة</Link>
        </div>
        <table className="w-full">
          <thead><tr>
            <th className="th">الحملة</th>
            <th className="th">الفترة</th>
            <th className="th">الحالة</th>
            <th className="th">السعر</th>
            <th className="th"></th>
          </tr></thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">لا توجد حملات بعد</td></tr>
            ) : campaigns.map((c: any) => {
              const [cls, label] = STATUS_BADGE[c.status] || ['badge-gray', c.status]
              return (
                <tr key={c.id} className="tr">
                  <td className="td font-medium">{c.name}</td>
                  <td className="td text-gray-400 text-xs">{c.start_date} – {c.end_date}</td>
                  <td className="td"><span className={`badge ${cls}`}>{label}</span></td>
                  <td className="td font-semibold">{Number(c.price || 0).toLocaleString('ar-SA')} ر.س</td>
                  <td className="td">
                    <Link href={`/campaigns/${c.id}`} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all inline-flex">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
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
