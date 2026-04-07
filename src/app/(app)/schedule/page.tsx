'use client'
import { useState } from 'react'
import { mockData } from '@/lib/supabase'

const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const schedules = [
  { id: '1', campaign: 'رمضان 2026', screen: 'كل الشاشات', from: '08:00', to: '22:00', days: 'أحد–خميس', dur: '30 ث' },
  { id: '2', campaign: 'عروض الصيف', screen: 'العليا 01', from: '12:00', to: '18:00', days: 'يومياً', dur: '20 ث' },
  { id: '3', campaign: 'منتج جديد', screen: 'النرجس 02', from: '09:00', to: '21:00', days: 'يومياً', dur: '15 ث' },
]

export default function SchedulePage() {
  const [list, setList] = useState(schedules)
  const [camp, setCamp] = useState('')
  const [screen, setScreen] = useState('')
  const [from, setFrom] = useState('08:00')
  const [to, setTo] = useState('22:00')
  const [dur, setDur] = useState('30')
  const [selDays, setSelDays] = useState(['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'])
  const [toast, setToast] = useState('')

  const toggleDay = (d: string) => setSelDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const save = () => {
    if (!camp || !screen) return alert('يرجى اختيار الحملة والشاشة')
    const newItem = { id: Date.now().toString(), campaign: camp, screen, from, to, days: selDays.join('، '), dur: dur + ' ث' }
    setList(l => [...l, newItem])
    setCamp(''); setScreen('')
    setToast('تم حفظ الجدولة بنجاح')
    setTimeout(() => setToast(''), 3000)
  }

  const del = (id: string) => {
    setList(l => l.filter(x => x.id !== id))
    setToast('تم حذف الجدولة')
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow">{toast}</div>}
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">الجدولة</h1>
      </div>

      <div className="card p-4 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-4">جدولة جديدة</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="label">الحملة *</label>
            <select className="input" value={camp} onChange={e => setCamp(e.target.value)}>
              <option value="">— اختر —</option>
              {mockData.campaigns.map((c: any) => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الشاشة *</label>
            <select className="input" value={screen} onChange={e => setScreen(e.target.value)}>
              <option value="">— اختر —</option>
              <option>كل الشاشات</option>
              {mockData.screens.map((s: any) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">من الساعة</label>
            <input className="input" type="time" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">إلى الساعة</label>
            <input className="input" type="time" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="label">مدة كل إعلان (ثانية)</label>
          <input className="input w-40" value={dur} onChange={e => setDur(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="label">أيام العرض</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {days.map(d => (
              <span key={d} onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border
                  ${selDays.includes(d) ? 'bg-primary-light text-primary border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                {d}
              </span>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={save}>حفظ الجدولة</button>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="section-title">الجدولة الحالية</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="th">الحملة</th>
              <th className="th">الشاشة</th>
              <th className="th">الوقت</th>
              <th className="th">الأيام</th>
              <th className="th">المدة</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">لا توجد جدولة بعد</td></tr>
            )}
            {list.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="td font-medium">{s.campaign}</td>
                <td className="td text-gray-600">{s.screen}</td>
                <td className="td text-gray-600">{s.from} – {s.to}</td>
                <td className="td text-gray-600">{s.days}</td>
                <td className="td text-gray-600">{s.dur}</td>
                <td className="td">
                  <button onClick={() => del(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
