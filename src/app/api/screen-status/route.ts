import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const { screenId, status } = await req.json()
  if (!screenId) return NextResponse.json({ error: 'screenId مطلوب' }, { status: 400 })

  await getSupabase()
    .from('screens')
    .update({ status, last_seen: new Date().toISOString() })
    .eq('id', screenId)

  return NextResponse.json({ success: true })
}
