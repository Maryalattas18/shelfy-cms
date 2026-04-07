'use client'
import { useState, useEffect, useRef } from 'react'
import { getMedia, uploadMedia, deleteMedia, getClients } from '@/lib/supabase'

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [selClient, setSelClient] = useState('')
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
    getClients().then(data => setClients(data as any[]))
  }, [])

  const load = async () => {
    setLoading(true)
    const data = await getMedia()
    setMedia(data as any[])
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return alert('يرجى اختيار ملف')
    if (!selClient) return alert('يرجى اختيار العميل')
    setUploading(true)
    const result = await uploadMedia(file, selClient)
    setUploading(false)
    if (result) {
      await load()
      setShowUpload(false)
      setSelClient('')
      showToast('تم رفع الملف بنجاح')
    } else {
      alert('فشل رفع الملف — تأكد من إعداد Storage في Supabase')
    }
  }

  const handleDelete = async (m: any) => {
    if (!confirm(`هل تريد حذف "${m.file_name}"؟`)) return
    await deleteMedia(m.id, m.file_url)
    await load()
    setSelected(null)
    showToast(`تم حذف "${m.file_name}"`)
  }

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}

      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">مكتبة المحتوى</h1>
        <button onClick={() => setShowUpload(true)} className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          رفع ملف
        </button>
      </div>

      <div onClick={() => setShowUpload(true)} className="card border-dashed border-2 border-gray-200 p-8 text-center mb-5 hover:border-primary hover:bg-primary-light transition-all cursor-pointer">
        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="text-sm font-medium text-gray-700">اسحب الملفات هنا أو اضغط للرفع</p>
        <p className="text-xs text-gray-400 mt-1">MP4 · JPG · PNG — حد أقصى 500 MB</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400 card">
              لا يوجد محتوى بعد — ارفع ملفاً للبدء
            </div>
          )}
          {media.map((m: any) => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="card cursor-pointer hover:border-primary hover:border transition-all">
              <div className="h-20 bg-gray-50 flex items-center justify-center border-b border-gray-50">
                {m.file_url && m.file_type === 'image' ? (
                  <img src={m.file_url} alt={m.file_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-1">{m.file_type === 'video' ? '🎬' : '🖼️'}</div>
                    <p className="text-xs text-gray-400">{m.file_type === 'video' ? `${m.duration_sec} ث` : 'صورة'}</p>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-900 truncate">{m.file_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.file_size_mb} MB · {m.client?.company_name || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">رفع ملف جديد</h2>
              <button onClick={() => setShowUpload(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="mb-3">
              <label className="label">العميل *</label>
              <select className="input" value={selClient} onChange={e => setSelClient(e.target.value)}>
                <option value="">— اختر عميلاً —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="label">الملف *</label>
              <input ref={fileRef} type="file" accept="video/*,image/*" className="input" />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setShowUpload(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'جاري الرفع...' : 'رفع'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">تفاصيل الملف</h2>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-4">
              {selected.file_type === 'video' ? '🎬' : '🖼️'}
            </div>
            {[
              ['الاسم', selected.file_name],
              ['النوع', selected.file_type === 'video' ? 'فيديو' : 'صورة'],
              ['المدة', selected.duration_sec + ' ثانية'],
              ['الحجم', selected.file_size_mb + ' MB'],
              ['العميل', selected.client?.company_name || '—'],
              ['تاريخ الرفع', new Date(selected.created_at).toLocaleDateString('ar-SA')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900 truncate max-w-40">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button className="btn btn-danger flex-1" onClick={() => handleDelete(selected)}>حذف</button>
              <button className="btn btn-secondary flex-1" onClick={() => setSelected(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
