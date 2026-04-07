'use client'
import { useState, useEffect } from 'react'
import { getClients, getCampaigns, getScreens } from '@/lib/supabase'
import Link from 'next/link'

const statusMap: Record<string, [string, string]> = {
  active: ['badge-green', 'نشطة'],
  scheduled: ['badge-amber', 'مجدولة'],
  draft: ['badge-blue', 'مسودة'],
  ended: ['badge-gray', 'منتهية'],
  online: ['badge-green', 'متصلة'],
  offline: ['badge-red', 'غير متصلة'],
  idle: ['badge-amber', 'خاملة'],
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [screens, setScreens] = useState<any[]>([])
  const [stats, setStats] = useState({ screens: { total: 0, online: 0 }, campaigns: { active: 0 }, clients: { total: 0 } })
  const [loading, setLoading] = useState(true)
  const date = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    const load = async () => {
      const [c, s, cl] = await Promise.all([getCampaigns(), getScreens(), getClients()])
      const camps = c as any[]
      const scrns = s as any[]
      const clients = cl as any[]
      setCampaigns(camps.slice(0, 4))
      setScreens(scrns.slice(0, 4))
      setStats({
        screens: { total: scrns.length, online: scrns.filter(s => s.status === 'online').length },
        campaigns: { active: camps.filter(c => c.status === 'active').length },
        clients: { total: clients.length },
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">نظرة عامة</h1>
        <p className="text-sm text-gray-400 mt-1">{date}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'الشاشات النشطة', value: `${stats.screens.online}/${stats.screens.total}`, sub: 'شاشة متصلة' },
          { label: 'الحملات الجارية', value: stats.campaigns.active, sub: 'حملة نشطة' },
          { label: 'العملاء', value: stats.clients.total, sub: 'عميل مسجل' },
          { label: 'عروض هذا الشهر', value: '—', sub: 'مرة عرض' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
            <span className="section-title">آخر الحملات</span>
            <Link href="/campaigns" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">الحملة</th><th className="th">العميل</th><th className="th">الحالة</th></tr></thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد حملات بعد</td></tr>
              )}
              {campaigns.map((c: any) => {
                const [cls, label] = statusMap[c.status] || ['badge-gray', c.status]
                return (
                  <tr key={c.id} className="tr">
                    <td className="td font-medium">{c.name}</td>
                    <td className="td text-gray-500">{c.client?.company_name || '—'}</td>
                    <td className="td"><span className={`badge ${cls}`}>{label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
            <span className="section-title">حالة الشاشات</span>
            <Link href="/screens" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">الشاشة</th><th className="th">الموقع</th><th className="th">الحالة</th></tr></thead>
            <tbody>
              {screens.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد شاشات بعد</td></tr>
              )}
              {screens.map((s: any) => {
                const [cls, label] = statusMap[s.status] || ['badge-gray', s.status]
                const dotCls = s.status === 'online' ? 'dot-online' : s.status === 'offline' ? 'dot-offline' : 'dot-idle'
                return (
                  <tr key={s.id} className="tr">
                    <td className="td"><span className={dotCls}></span>{s.name}</td>
                    <td className="td text-gray-500">{s.location?.name || '—'}</td>
                    <td className="td"><span className={`badge ${cls}`}>{label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
