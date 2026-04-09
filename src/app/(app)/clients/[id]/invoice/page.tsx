'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getClients, getCampaigns } from '@/lib/supabase'

export default function InvoicePage() {
  const { id } = useParams()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const invoiceNum = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    Promise.all([getClients(), getCampaigns()]).then(([clients, camps]) => {
      const found = (clients as any[]).find(c => c.id === id)
      const clientCamps = (camps as any[]).filter(c => c.client_id === id)
      setClient(found)
      setCampaigns(clientCamps)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!client) return <div className="text-center py-20 text-gray-400">العميل غير موجود</div>

  const total = campaigns.reduce((s, c) => s + Number(c.price || 0), 0)
  const vat = total * 0.15
  const grand = total + vat

  return (
    <>
      {/* أزرار الطباعة — تختفي عند الطباعة */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button onClick={() => router.back()} className="btn btn-secondary">→ رجوع</button>
        <button onClick={() => window.print()} className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          طباعة / حفظ PDF
        </button>
      </div>

      {/* الفاتورة */}
      <div id="invoice" style={{ maxWidth: 750, margin: '0 auto', background: 'white', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>

        {/* هيدر */}
        <div style={{ background: '#0e1117', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '14px 14px 0 0' }}>
          <div>
            <img src="/shelfy-logo.png" alt="Shelfy" style={{ height: 52, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'left', color: 'white' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#378ADD' }}>فاتورة ضريبية</div>
            <div style={{ fontSize: 13, color: '#8899aa', marginTop: 4 }}>{invoiceNum}</div>
          </div>
        </div>

        {/* تفاصيل الفاتورة والعميل */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0ee', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>صادرة إلى</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{client.company_name}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{client.type === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}</div>
            {client.email && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{client.email}</div>}
            {client.phone && <div style={{ fontSize: 12, color: '#999' }}>{client.phone}</div>}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>تفاصيل الفاتورة</div>
            {[
              ['رقم الفاتورة', invoiceNum],
              ['تاريخ الإصدار', today],
              ['طريقة الدفع', 'تحويل بنكي'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#999' }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#333' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* جدول الحملات */}
        <div style={{ padding: '24px 32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['الحملة', 'الفترة', 'الحالة', 'المبلغ'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, color: '#888', fontWeight: 600, borderBottom: '2px solid #e8e8e4', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#bbb', fontSize: 13 }}>لا توجد حملات</td></tr>
              ) : campaigns.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f3', background: i % 2 === 0 ? 'white' : '#fafaf8' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#111' }}>{c.name}</td>
                  <td style={{ padding: '12px', color: '#666', fontSize: 12 }}>{c.start_date} — {c.end_date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: c.status === 'active' ? '#dcfce7' : c.status === 'ended' ? '#f1f5f9' : '#fef9c3',
                      color: c.status === 'active' ? '#15803d' : c.status === 'ended' ? '#64748b' : '#a16207',
                    }}>
                      {c.status === 'active' ? 'نشطة' : c.status === 'ended' ? 'منتهية' : c.status === 'draft' ? 'مسودة' : 'مجدولة'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#111' }}>{Number(c.price || 0).toLocaleString('ar-SA')} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* الإجمالي */}
        <div style={{ padding: '0 32px 28px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 280 }}>
            {[
              ['المجموع قبل الضريبة', `${total.toLocaleString('ar-SA')} ر.س`],
              ['ضريبة القيمة المضافة 15%', `${vat.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0ee', fontSize: 13 }}>
                <span style={{ color: '#666' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#0e1117', borderRadius: 10, marginTop: 10 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>الإجمالي</span>
              <span style={{ color: '#378ADD', fontWeight: 800, fontSize: 16 }}>{grand.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س</span>
            </div>
          </div>
        </div>

        {/* فوتر */}
        <div style={{ background: '#f8f9fa', padding: '16px 32px', borderRadius: '0 0 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e8e8e4' }}>
          <div style={{ fontSize: 11, color: '#999' }}>
            <span style={{ fontWeight: 700, color: '#378ADD' }}>Shelfy Screens</span>
            {' · '}شبكة الإعلانات الرقمية — المملكة العربية السعودية
          </div>
          <div style={{ fontSize: 11, color: '#ccc' }}>hello@shelfyscreens.com</div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          #invoice { max-width: 100% !important; box-shadow: none !important; }
        }
      `}</style>
    </>
  )
}
