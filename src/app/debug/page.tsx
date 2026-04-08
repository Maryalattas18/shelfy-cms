export default function DebugPage() {
  return (
    <div style={{padding:20,fontFamily:'monospace'}}>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'}</p>
      <p>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0,20) + '...' : 'MISSING'}</p>
    </div>
  )
}
