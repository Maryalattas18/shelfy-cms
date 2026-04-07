'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { mockData, getClients } from '@/lib/supabase'

const steps = ['المعلومات', 'المحتوى', 'الشاشات', 'الجدولة']
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [clientsList, setClientsList] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', client: '', start: '', end: '', price: '', priority: 'normal', notes: '' })
  const [selMedia, setSelMedia] = useState<string[]>([])
  const [selScreens, setSelScreens] = useState<string[]>([])
  const [selDays, setSelDays] = useState(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'])
  const [timeFrom, setTimeFrom] = useState('08:00')
  const [timeTo, setTimeTo] = useState('22:00')
  const [dur, setDur] = useState('30')

  useEffect(() => {
    getClients().then(data => setClientsList(data as any[]))
  }, [])

  const next = () => {
    if (step === 0 && (!form.name || !form.client)) return alert('يرجى تعبئة اسم الحملة والعميل')
    if (step === 1 && selMedia.length === 0) return alert('يرجى اختيار ملف واحد على الأقل')
    if (step === 2 && selScreens.length === 0) return alert('يرجى اختيار شاشة واحدة على الأقل')
    if (step < 3) setStep(s => s + 1)
  }

  const save = (status: string) => {
    alert(`تم ${status === 'active' ? 'نشر' : 'حفظ'} الحملة "${form.name}" بنجاح!`)
    router.push('/campaigns')
  }

  const toggleMedia = (id: string) => setSelMedia(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleScreen = (id: string) => setSelScreens(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleDay = (d: string) => setSelDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const statusColors: Record<string, string> = { online: 'badge-green', idle: 'badge-amber', offline: 'badge-red' }
  const statusLabels: Record<string, string> = { online: 'متصلة', idle: 'خاملة', offline: 'غير متصلة' }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/campaigns')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="page-title">حملة جديدة</h1>
          <p className="text-xs text-gray-400">الخطوة {step + 1} من {steps.length}</p>
        </div>
      </div>

      <div className="flex gap-0 mb-6 card overflow-hidden">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 py-2.5 text-center text-xs font-medium transition-all border-l last:border-l-0 border-gray-100
            ${i < step ? 'bg-primary-light text-primary' : i === step ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
            {i < step ? '✓ ' : ''}{s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">اسم الحملة *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: رمضان 2026" />
            </div>
            <div>
              <label className="label">العميل *</label>
              <select className="input" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}>
                <option value="">— اختر عميلاً —</option>
                {clientsList.map(c => <option key={c.id} value={c.company_name}>{c.company_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">تاريخ البداية *</label>
              <input className="input" type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            </div>
            <div>
              <label className="label">تاريخ النهاية *</label>
              <input className="input" type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">السعر (ريال)</label>
              <input className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="label">الأولوية</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="normal">عادية</option>
                <option value="high">عالية</option>
                <option value="urgent">طارئة</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="label">ملاحظات</label>
            <textarea className="input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="أي تعليمات خاصة..." />
          </div>
          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={next}>التالي: اختيار المحتوى ←</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-4">اختر ملفاً أو أكثر من المكتبة</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {mockData.media.map(m => (
              <div key={m.id} onClick={() => toggleMedia(m.id)}
                className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${selMedia.includes(m.id) ? 'border-2 border-primary' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="h-16 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                  {m.file_type === 'video' ? `فيديو ${m.duration_sec} ث` : 'صورة'}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{m.file_name}</p>
                  <p className="text-xs text-gray-400">{m.file_size_mb} MB · {m.client?.company_name}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">{selMedia.length > 0 ? `تم اختيار ${selMedia.length} ملف` : 'لم يتم اختيار أي ملف'}</p>
          <div className="flex justify-between">
            <button className="btn btn-secondary" onClick={() => setStep(0)}>→ السابق</button>
            <button className="btn btn-primary" onClick={next}>التالي: الشاشات ←</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-3">اختر الشاشات التي ستعرض هذه الحملة</p>
          <div className="flex gap-2 mb-4">
            <button className="btn btn-secondary text-xs" onClick={() => setSelScreens(mockData.screens.map(s => s.id))}>تحديد الكل</button>
            <button className="btn btn-secondary text-xs" onClick={() => setSelScreens([])}>إلغاء الكل</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {mockData.screens.map(s => (
              <div key={s.id} onClick={() => toggleScreen(s.id)}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${selScreens.includes(s.id) ? 'border-2 border-primary bg-primary-light' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.location?.name}</p>
                  </div>
                  <span className={`badge ${statusColors[s.status]}`}>{statusLabels[s.status]}</span>
                </div>
                <div className="h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-400">{s.last_seen}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">{selScreens.length > 0 ? `تم اختيار ${selScreens.length} شاشة` : 'لم يتم اختيار أي شاشة'}</p>
          <div className="flex justify-between">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>→ السابق</button>
            <button className="btn btn-primary" onClick={next}>التالي: الجدولة ←</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">وقت البداية</label>
              <input className="input" type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} />
            </div>
            <div>
              <label className="label">وقت النهاية</label>
              <input className="input" type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="label">مدة كل إعلان (ثانية)</label>
            <input className="input" value={dur} onChange={e => setDur(e.target.value)} />
          </div>
          <div className="mb-5">
            <label className="label">أيام العرض</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {days.map(d => (
                <span key={d} onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border
                    ${selDays.includes(d) ? 'bg-primary-light text-primary border-primary' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-gray-600 mb-3">ملخص الحملة</p>
            {[
              ['الاسم', form.name],
              ['العميل', form.client],
              ['الفترة', `${form.start} – ${form.end}`],
              ['المحتوى', `${selMedia.length} ملف`],
              ['الشاشات', `${selScreens.length} شاشة`],
              ['الأوقات', `${timeFrom} – ${timeTo}`],
              ['السعر', `${form.price || 0} ريال`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>→ السابق</button>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={() => save('draft')}>حفظ كمسودة</button>
              <button className="btn btn-primary" onClick={() => save('active')}>نشر الحملة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
