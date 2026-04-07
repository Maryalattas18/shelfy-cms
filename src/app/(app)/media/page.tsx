'use client'
import { useState } from 'react'
import { mockData } from '@/lib/supabase'

export default function MediaPage() {
  const [media] = useState(mockData.media)
  const [selected, setSelected] = useState<any>(null)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">مكتبة المحتوى</h1>
        <button className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          رفع ملف
        </button>
      </div>

      <div className="card border-dashed border-2 border-gray-200 p-8 text-center mb-5 hover:border-primary hover:bg-primary-light transition-all cursor-pointer">
        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="text-sm font-medium text-gray-700">اسحب الملفات هنا أو اضغط للرفع</p>
        <p className="text-xs text-gray-400 mt-1">MP4 · JPG · PNG — حد أقصى 500 MB</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((m: any) => (
          <div key={m.id} onClick={() => setSelected(m)}
            className="card cursor-pointer hover:border-primary hover:border transition-all">
            <div className="h-20 bg-gray-50 flex items-center justify-center border-b border-gray-50">
              <div className="text-center">
                <div className="text-2xl mb-1">{m.file_type === 'video' ? '🎬' : '🖼️'}</div>
                <p className="text-xs text-gray-400">{m.file_type === 'video' ? `${m.duration_sec} ث` : 'صورة'}</p>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-gray-900 truncate">{m.file_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.file_size_mb} MB · {m.client?.company_name}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">تفاصيل الملف</h2>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-4">{selected.file_type === 'video' ? '🎬' : '🖼️'}</div>
            {[['الاسم', selected.file_name], ['النوع', selected.file_type === 'video' ? 'فيديو' : 'صورة'], ['المدة', selected.duration_sec + ' ثانية'], ['الحجم', selected.file_size_mb + ' MB'], ['العميل', selected.client?.company_name], ['تاريخ الرفع', selected.created_at]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900 truncate max-w-40">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button className="btn btn-danger flex-1" onClick={() => setSelected(null)}>حذف</button>
              <button className="btn btn-primary flex-1" onClick={() => setSelected(null)}>استخدام في حملة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
