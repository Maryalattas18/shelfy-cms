'use client'
import { useState } from 'react'
import Link from 'next/link'

type Campaign = { id: string; name: string; client: string; start: string; end: string; price: number; status: string }

const statusMap: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft: ['badge-blue', 'مسودة'],
  paused: ['badge-gray', 'موقوفة'],
  ended: ['badge-gray', 'منتهية'],
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [notify, setNotify] = useState('')

  const del = (id: string, name: string) => {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return
    setCampaigns(p => p.filter(c => c.id !== id))
    setNotify(`تم حذف "${name}"`)
    setTimeout(() => setNotify(''), 3000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>الحملات الإعلانية</h1>
        <Link href="/campaigns/new" className="btn btn-primary">+ حملة جديدة</Link>
      </div>

      {notify && <div className="notify notify-success" style={{ marginBottom: 14 }}>{notify}</div>}

      <div className="card">
        {campaigns.length === 0 ? (
          <div style={{ padding: '60px 16px', textAlign: 'center', color: '#bbb', fontSize: 13 }}>
            لا توجد حملات بعد —{' '}
            <Link href="/campaigns/new" style={{ color: '#378ADD', textDecoration: 'none' }}>أضف حملة جديدة</Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>الحملة</th><th>العميل</th><th>البداية</th><th>النهاية</th><th>السعر</th><th>الحالة</th><th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: '#666' }}>{c.client}</td>
                  <td style={{ color: '#666' }}>{c.start}</td>
                  <td style={{ color: '#666' }}>{c.end}</td>
                  <td style={{ fontWeight: 500 }}>{c.price.toLocaleString()} ر</td>
                  <td><span className={`badge ${statusMap[c.status]?.[0]}`}>{statusMap[c.status]?.[1]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link href={`/campaigns/${c.id}`} className="btn btn-sm">عرض</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => del(c.id, c.name)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
