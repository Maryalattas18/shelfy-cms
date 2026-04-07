'use client'
import { useRouter } from 'next/navigation'
import { mockData } from '@/lib/supabase'
import Link from 'next/link'

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const client = mockData.clients.find(c => c.id === params.id) || mockData.clients[0]
  const clientCampaigns = mockData.campaigns.filter((c: any) => c.client?.company_name === client.company_name)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/clients')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="page-title">{client.company_name}</h1>
          <p className="text-sm text-gray-400">{client.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}</p>
        </div>
        <Link href="/campaigns/new" className="btn btn-primary">+ حملة جديدة</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card p-4">
          <p className="section-title mb-3">معلومات التواصل</p>
          {[
            ['البريد', client.email || '—'],
            ['الهاتف', client.phone || '—'],
            ['النوع', client.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'],
            ['تاريخ الانضمام', 'يناير 2025'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        <div className="card p-4">
          <p className="section-title mb-3">ملخص مالي</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <p className="text-xs text-gray-500 mb-1">إجمالي الإيراد</p>
              <p className="text-xl font-bold text-gray-900">{client.balance.toLocaleString('ar')} ر</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-gray-500 mb-1">عدد الحملات</p>
              <p className="text-xl font-bold text-gray-900">{clientCampaigns.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50"><p className="section-title">الحملات</p></div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="th">الحملة</th><th className="th">الفترة</th><th className="th">الحالة</th><th className="th">السعر</th>
          </tr></thead>
          <tbody>
            {clientCampaigns.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">لا توجد حملات بعد</td></tr>
            ) : clientCampaigns.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="td font-medium">{c.name}</td>
                <td className="td text-gray-500">{c.start_date} – {c.end_date}</td>
                <td className="td"><span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'draft' ? 'badge-blue' : 'badge-amber'}`}>{c.status === 'active' ? 'نشطة' : c.status === 'draft' ? 'مسودة' : 'مجدولة'}</span></td>
                <td className="td font-medium">{Number(c.price).toLocaleString('ar')} ر</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
