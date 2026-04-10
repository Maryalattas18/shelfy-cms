'use client'
import { useState, useEffect } from 'react'

const STATUS_AR: Record<string, [string, string]> = {
  active:    ['#eaf3de', '#27500a', 'نشطة'],
  draft:     ['#e6f1fb', '#0c447c', 'مسودة'],
  paused:    ['#faeeda', '#633806', 'موقوفة'],
  ended:     ['#f1efe8', '#5f5e5a', 'منتهية'],
  scheduled: ['#fef3c7', '#92400e', 'مجدولة'],
} as any

function toMonthAr(month: string) {
  const [y, m] = month.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
}

export default function ReportsPage() {
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [month, setMonth] = useState(defaultMonth)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stats?type=monthly&month=${month}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [month])

  const handlePrint = () => window.print()

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { padding: 0 !important; }
        }
      `}</style>

      <div className="print-page">
        {/* ─── Header ─── */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 2 }}>التقرير الشهري</h1>
            <p style={{ fontSize: 13, color: '#999' }}>ملخص الإيرادات والحملات جاهز للطباعة</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{
                padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: 13, color: '#333', background: 'white', outline: 'none',
                fontFamily: 'Cairo, sans-serif',
              }}
            />
            <button
              onClick={handlePrint}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', background: '#0e1117', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              طباعة / PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e6f1fb', borderTop: '3px solid #378ADD', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : !data || data.error ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa', fontSize: 14 }}>لا توجد بيانات لهذا الشهر</div>
        ) : (
          <div id="report-content">

            {/* ─── Print Header (visible only on print) ─── */}
            <div style={{ display: 'none' }} className="print-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0e1117', paddingBottom: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0e1117' }}>Shelfy Screens</div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>شبكة الإعلانات الرقمية</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>التقرير الشهري</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{toMonthAr(month)}</div>
                </div>
              </div>
            </div>
            <style>{`@media print { .print-header { display: block !important; } }`}</style>

            {/* ─── Month Title ─── */}
            <div style={{
              background: 'linear-gradient(135deg, #0e1117, #1a2540)',
              borderRadius: 16, padding: '20px 24px', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white',
            }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>التقرير الشهري</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{toMonthAr(month)}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>Shelfy Screens</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* ─── Stats ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'إجمالي الإيرادات', value: `${data.totalRevenue.toLocaleString('ar-SA')} ر.س`, color: '#27a376', icon: '💰' },
                { label: 'الحملات في الشهر', value: data.totalCampaigns, color: '#378ADD', icon: '📢' },
                { label: 'الحملات النشطة', value: data.activeCampaigns, color: '#7F77DD', icon: '▶' },
                { label: 'مرات العرض', value: data.totalPlays.toLocaleString('ar-SA'), color: '#ef9f27', icon: '👁' },
                { label: 'ساعات البث', value: `${data.totalHours} ساعة`, color: '#ec4899', icon: '⏱' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'white', border: '1px solid #ebebea', borderRadius: 14,
                  padding: '16px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

              {/* ─── Client Breakdown ─── */}
              <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>الإيرادات حسب العميل</span>
                  <span style={{ fontSize: 12, color: '#bbb' }}>{data.clientBreakdown.length} عميل</span>
                </div>
                <div style={{ padding: '14px 18px' }}>
                  {data.clientBreakdown.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#ccc', fontSize: 13, padding: '20px 0' }}>لا توجد إيرادات</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {data.clientBreakdown.map((c: any, i: number) => {
                        const maxRev = data.clientBreakdown[0].revenue
                        const pct = Math.round((c.revenue / maxRev) * 100)
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{c.name}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#27a376' }}>{c.revenue.toLocaleString('ar-SA')} ر.س</span>
                            </div>
                            <div style={{ height: 6, background: '#f0f0ee', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #378ADD, #185FA5)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{c.campaigns.length} حملة</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Summary Box ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: 14, padding: '20px 18px', flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600, marginBottom: 8 }}>إجمالي الإيرادات</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#14532d', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {data.totalRevenue.toLocaleString('ar-SA')}
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#15803d', marginRight: 6 }}>ر.س</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#16a34a', marginTop: 8 }}>شهر {toMonthAr(month)}</div>
                </div>

                <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>توزيع الحملات</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'نشطة', value: data.activeCampaigns, color: '#27a376' },
                      { label: 'منتهية', value: data.endedCampaigns, color: '#888' },
                      { label: 'الإجمالي', value: data.totalCampaigns, color: '#378ADD' },
                      { label: 'مرات العرض', value: data.totalPlays, color: '#ef9f27' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', background: '#fafaf8', borderRadius: 8, padding: '10px 8px' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Campaigns Table ─── */}
            <div style={{ background: 'white', border: '1px solid #ebebea', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>الحملات الإعلانية</span>
                <span style={{ fontSize: 12, color: '#bbb', background: '#f5f5f3', padding: '3px 10px', borderRadius: 999 }}>{data.campaigns.length} حملة</span>
              </div>
              {data.campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ccc', fontSize: 14 }}>لا توجد حملات لهذا الشهر</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafaf8', borderBottom: '1px solid #f0f0ee' }}>
                      {['الحملة', 'العميل', 'الفترة', 'الحالة', 'القيمة'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#999', textAlign: 'right', fontFamily: 'Cairo, sans-serif' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((c: any) => {
                      const [bg, fg, label] = (STATUS_AR[c.status] || ['#f1efe8', '#5f5e5a', c.status]) as [string, string, string]
                      const clientName = (c.clients as any)?.company_name || '—'
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f3' }}>
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#111' }}>{c.name}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, color: '#555' }}>{clientName}</td>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: '#999', direction: 'ltr', textAlign: 'right' }}>
                            {c.start_date} — {c.end_date}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: c.price > 0 ? '#27a376' : '#ccc', textAlign: 'left', direction: 'ltr' }}>
                            {c.price > 0 ? `${Number(c.price).toLocaleString('ar-SA')} ر.س` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8f8f6', borderTop: '2px solid #ebebea' }}>
                      <td colSpan={4} style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#555' }}>الإجمالي</td>
                      <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 900, color: '#27a376', textAlign: 'left', direction: 'ltr' }}>
                        {data.totalRevenue.toLocaleString('ar-SA')} ر.س
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ─── Print Footer ─── */}
            <div style={{ display: 'none' }} className="print-footer">
              <div style={{ borderTop: '1px solid #e5e5e3', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
                <span>Shelfy Screens · شبكة الإعلانات الرقمية</span>
                <span>تقرير {toMonthAr(month)} · تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            <style>{`@media print { .print-footer { display: block !important; } }`}</style>

          </div>
        )}
      </div>
    </>
  )
}
