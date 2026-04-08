'use client'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/debug')
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false) })
      .catch(e => { setResult({ error: e.message }); setLoading(false) })
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Shelfy Debug</h2>

      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Environment Variables:</h3>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'}</p>
      <p>ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...'
        : 'MISSING'}</p>

      <hr style={{ margin: '16px 0' }} />

      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Database Connection (via Service Key):</h3>
      {loading ? (
        <p>جاري الفحص...</p>
      ) : result?.error ? (
        <p style={{ color: 'red' }}>خطأ: {result.error}</p>
      ) : (
        <>
          <p style={{ color: 'green', marginBottom: 8 }}>الاتصال يعمل</p>
          <p style={{ marginBottom: 4 }}>Service Key: {result?.env?.SERVICE_KEY || 'MISSING'}</p>
          <h4 style={{ fontSize: 13, margin: '12px 0 6px' }}>الجداول:</h4>
          {result?.tables && Object.entries(result.tables).map(([table, info]: any) => (
            <p key={table} style={{ color: info.error ? 'red' : 'green' }}>
              {table}: {info.error ? `خطأ - ${info.error}` : `${info.count} صف`}
            </p>
          ))}
        </>
      )}

      <hr style={{ margin: '16px 0' }} />
      <details>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>Raw JSON</summary>
        <pre style={{ fontSize: 11, marginTop: 8 }}>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  )
}
