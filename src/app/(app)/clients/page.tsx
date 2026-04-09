'use client'
import { useState, useEffect } from 'react'
import { getClients, createClient_, deleteClient, updateClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState<any>(null)
  const [form, setForm] = useState({ name: '', type: 'brand', email: '', phone: '' })
  const [toast, setToast] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const data = await getClients()
    setClients(data as any[])
    setLoading(false)
  }

  const openAdd = () => {
    setEditClient(null)
    setForm({ name: '', type: 'brand', email: '', phone: '' })
    setShowModal(true)
  }

  const openEdit = (c: any) => {
    setEditClient(c)
    setForm({ name: c.company_name, type: c.type, email: c.email || '', phone: c.phone || '' })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name) return alert('يرجى إدخال اسم الشركة')
    let result
    if (editClient) {
      result = await updateClient(editClient.id, { company_name: form.name, type: form.type, email: form.email, phone: form.phone })
    } else {
      result = await createClient_({ company_name: form.name, type: form.type, email: form.email, phone: form.phone })
    }
    if (!result) return alert('حدث خطأ في الحفظ — تحقق من الاتصال بقاعدة البيانات')
    setToast(editClient ? `تم تعديل "${form.name}" بنجاح` : `تم إضافة "${form.name}" بنجاح`)
    await load()
    setShowModal(false)
    setTimeout(() => setToast(''), 3000)
    setForm({ name: '', type: 'brand', email: '', phone: '' })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return
    await deleteClient(id)
    await load()
    setToast(`تم حذف "${name}"`)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">العملاء</h1>
        <button onClick={openAdd} className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          عميل جديد
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="card">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="th">الشركة</th>
              <th className="th">النوع</th>
              <th className="th">التواصل</th>
              <th className="th">الرصيد</th>
              <th className="th"></th>
            </tr></thead>
            <tbody>
              {clients.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">لا يوجد عملاء بعد</td></tr>
              )}
              {clients.map((c: any) => (
                <tr key={c.id} className="tr border-b border-gray-50">
                  <td className="td font-medium">{c.company_name}</td>
                  <td className="td">
                    <span className={`badge ${c.type === 'brand' ? 'badge-blue' : 'badge-teal'}`}>
                      {c.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}
                    </span>
                  </td>
                  <td className="td text-gray-500 text-xs">{c.email || c.phone || '—'}</td>
                  <td className="td font-medium text-green-700">
                    {c.balance > 0 ? Number(c.balance).toLocaleString('ar') + ' ر' : '—'}
                  </td>
                  <td className="td">
                    <div className="flex gap-2 justify-end">
                      {c.portal_token && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/portal/${c.portal_token}`); setToast(`تم نسخ رابط بوابة ${c.company_name}`) }}
                          title="نسخ رابط البوابة"
                          className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </button>
                      )}
                      <Link href={`/clients/${c.id}`} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(c.id, c.company_name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">{editClient ? 'تعديل العميل' : 'إضافة عميل جديد'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">اسم الشركة *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: بيبسي" />
              </div>
              <div>
                <label className="label">النوع</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="brand">شركة منتجات</option>
                  <option value="minimarket">ميني ماركت</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">البريد</label>
                <input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@co.com" />
              </div>
              <div>
                <label className="label">الهاتف</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05xxxxxxxx" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={save}>{editClient ? 'حفظ التعديل' : 'إضافة'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
