
'use client'
import { getClients, createClient_ } from '@/lib/supabase'

import { useState, useEffect } from 'react'
import { getClients } from '@/lib/supabase'
import Link from 'next/link'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'brand', email: '', phone: '' })
  const [toast, setToast] = useState('')

  useEffect(() => {
    getClients().then(data => {
      setClients(data as any[])
      setLoading(false)
    })
  }, [])

  const save = async () => {
  if (!form.name) return alert('يرجى إدخال اسم الشركة')
  await createClient_({ company_name: form.name, type: form.type, email: form.email, phone: form.phone })
  const updated = await getClients()
  setClients(updated as any[])
  setShowModal(false)
  setToast(`تم إضافة العميل "${form.name}" بنجاح`)
  setTimeout(() => setToast(''), 3000)
  setForm({ name: '', type: 'brand', email: '', phone: '' })
}
  

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">العملاء</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
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
              <th className="th">الشركة</th><th className="th">النوع</th><th className="th">التواصل</th><th className="th">الرصيد</th><th className="th"></th>
            </tr></thead>
            <tbody>
              {clients.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">لا يوجد عملاء بعد</td></tr>
              )}
              {clients.map((c: any) => (
                <tr key={c.id} className="tr border-b border-gray-50">
                  <td className="td font-medium">{c.company_name}</td>
                  <td className="td"><span className={`badge ${c.type === 'brand' ? 'badge-blue' : 'badge-teal'}`}>{c.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}</span></td>
                  <td className="td text-gray-500 text-xs">{c.email || c.phone || '—'}</td>
                  <td className="td font-medium text-green-700">{c.balance > 0 ? Number(c.balance).toLocaleString('ar') + ' ر' : '—'}</td>
                  <td className="td">
                    <Link href={`/clients/${c.id}`} className="btn btn-secondary text-xs py-1 px-3">عرض</Link>
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
              <h2 className="font-semibold text-gray-900">إضافة عميل جديد</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="label">اسم الشركة *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: بيبسي" /></div>
              <div><label className="label">النوع</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="brand">شركة منتجات</option><option value="minimarket">ميني ماركت</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="label">البريد</label><input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@co.com" /></div>
              <div><label className="label">الهاتف</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05xxxxxxxx" /></div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn btn-primary flex-1" onClick={save}>حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
