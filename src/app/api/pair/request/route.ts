import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function genTempCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST() {
  const supabase = getSupabase()

  // أنشئ كود مؤقت فريد
  let tempCode = ''
  for (let i = 0; i < 10; i++) {
    tempCode = genTempCode()
    const { data } = await supabase
      .from('pairing_requests')
      .select('id')
      .eq('temp_code', tempCode)
      .eq('status', 'pending')
      .single()
    if (!data) break
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error } = await supabase.from('pairing_requests').insert({
    temp_code: tempCode,
    status: 'pending',
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tempCode, expiresAt })
}
