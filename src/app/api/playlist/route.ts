import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'كود مطلوب' }, { status: 400 })

  const { data: screen, error: screenError } = await supabase
    .from('screens')
    .select('id, name, status')
    .eq('pair_code', code.toUpperCase())
    .single()

  if (screenError || !screen) {
    return NextResponse.json({ error: 'كود الشاشة غير صحيح' }, { status: 404 })
  }

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = dayNames[now.getDay()]

  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      *,
      campaign:campaigns(
        id, name, status,
        campaign_media(
          order_num,
          media(id, file_name, file_url, file_type, duration_sec)
        )
      )
    `)
    .eq('screen_id', screen.id)
    .lte('start_time', currentTime)
    .gte('end_time', currentTime)

  const playlist: any[] = []

  if (schedules && schedules.length > 0) {
    for (const schedule of schedules) {
      const campaign = schedule.campaign
      if (!campaign || campaign.status !== 'active') continue
      if (!schedule.days_of_week?.includes(today)) continue
      const mediaItems = campaign.campaign_media || []
      mediaItems.sort((a: any, b: any) => a.order_num - b.order_num)
      for (const item of mediaItems) {
        if (item.media) {
          playlist.push({
            ...item.media,
            duration_sec: schedule.duration_sec || item.media.duration_sec || 15
          })
        }
      }
    }
  }

  await supabase
    .from('screens')
    .update({ status: 'online', last_seen: new Date().toISOString() })
    .eq('id', screen.id)

  return NextResponse.json({ screenId: screen.id, screenName: screen.name, playlist })
}
