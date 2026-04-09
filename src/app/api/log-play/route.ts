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
  const { screenId, mediaId, duration } = await req.json()
  if (!screenId || !mediaId) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  await getSupabase().from('play_logs').insert({
    screen_id: screenId,
    media_id: mediaId,
    duration_sec: duration,
    played_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}
