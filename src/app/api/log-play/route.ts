import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(req: NextRequest) {
  const { screenId, mediaId, duration } = await req.json()
  if (!screenId || !mediaId) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  await supabase.from('play_logs').insert({
    screen_id: screenId,
    media_id: mediaId,
    duration_sec: duration,
    played_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}

