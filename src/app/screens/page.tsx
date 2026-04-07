'use client'
import { useState } from 'react'
import { mockData } from '@/lib/supabase'
import Link from 'next/link'

const statusMap: Record<string, [string, string, string]> = {
  online: ['badge-green', 'متصلة', 'dot-online'],
  offline: ['badge-red', 'غير متصلة', 'dot-offline'],
  idle: ['badge-amber', 'خاملة', 'dot-idle'],
}

export default function ScreensPage() {
  const [screens] = useState(mockData.screens)
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">الشاشات</h1>
        <Link href="/screens/new" className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          ربط شاشة جديدة
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {screens.map((s: any) => {
          const [badgeCls, badgeLabel, dotCls] = statusMap[s.status] || ['badge-gray', s.status, '']
          return (
            <Link key={s.id} href={`/screens/${s.id}`}
              className="card p-4 hover:border-primary hover:border transition-all cursor-pointer block">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.location?.name}</p>
                </div>
                <span className={`badge ${badgeCls}`}><span className={`${dotCls} ml-1`}></span>{badgeLabel}</span>
              </div>
              <div className="h-14 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-400 mb-3">
                {s.status === 'online' ? 'يعرض الآن: رمضان 2026' : s.status === 'idle' ? 'لا يوجد محتوى مجدول' : 'انقطع الاتصال'}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>آخر اتصال: {s.last_seen}</span>
                <span>كود: <span className="font-mono text-gray-600">{s.pair_code}</span></span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
