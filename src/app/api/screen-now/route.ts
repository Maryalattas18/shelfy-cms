import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/screen-now?ids=id1,id2,id3
// Returns the latest playing media for each screen
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids')
  if (!idsParam) return NextResponse.json({})

  const ids = idsParam.split(',').filter(Boolean)
  if (ids.length === 0) return NextResponse.json({})

  const supabase = getSupabase()

  // جلب آخر سجل تشغيل لكل شاشة دفعة واحدة
  const { data: logs } = await supabase
    .from('play_logs')
    .select('screen_id, media_id, played_at, media:media(id, file_name, file_url, file_type, duration_sec)')
    .in('screen_id', ids)
    .order('played_at', { ascending: false })

  if (!logs) return NextResponse.json({})

  // خذ أحدث سجل لكل شاشة
  const result: Record<string, any> = {}
  for (const log of logs) {
    if (!result[log.screen_id]) {
      result[log.screen_id] = {
        media: log.media,
        played_at: log.played_at,
      }
    }
  }

  return NextResponse.json(result)
}
