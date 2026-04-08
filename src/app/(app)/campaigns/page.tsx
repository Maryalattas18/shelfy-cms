'use client'
import { useState, useEffect } from 'react'
import { getCampaigns, deleteCampaign_ } from '@/lib/supabase'
import Link from 'next/link'

const statusMap: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft: ['badge-blue', 'مسودة'],
  paused: ['badge-gray', 'موقوفة'],
  ended: ['badge-gray', 'منتهية'],
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const data = await getCampaigns()
    setCampaigns(data as any[])
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف حملة "${name}"؟`)) return
    await deleteCampaign_(id)
    await load()
    setToast(`تم حذف "${name}"`)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">الحملات الإعلانية</h1>
        <Link href="/campaigns/new" className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          حملة جديدة
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="th">الحملة</th>
                <th className="th">العميل</th>
                <th className="th">البداية</th>
                <th className="th">النهاية</th>
                <th className="th">السعر</th>
                <th className="th">الحالة</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  لا توجد حملات — <Link href="/campaigns/new" className="text-primary">أضف حملة جديدة</Link>
                </td></tr>
              )}
              {campaigns.map((c: any) => {
                const [cls, label] = statusMap[c.status] || ['badge-gray', c.status]
                return (
                  <tr key={c.id} className="tr border-b border-gray-50">
                    <td className="td font-medium">{c.name}</td>
                    <td className="td text-gray-500">{c.client?.company_name || '—'}</td>
                    <td className="td text-gray-500">{c.start_date}</td>
                    <td className="td text-gray-500">{c.end_date}</td>
                    <td className="td font-medium">{Number(c.price).toLocaleString('ar')} ر</td>
                    <td className="td"><span className={`badge ${cls}`}>{label}</span></td>
                    <td className="td">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/campaigns/${c.id}`} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

