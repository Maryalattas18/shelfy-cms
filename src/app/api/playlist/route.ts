import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'كود مطلوب' }, { status: 400 })

  const supabase = getSupabase()

  const { data: screen, error: screenError } = await supabase
    .from('screens')
    .select('id, name, status, orientation, fit_mode')
    .eq('pair_code', code.toUpperCase())
    .single()

  if (screenError || !screen) {
    return NextResponse.json({ error: 'كود الشاشة غير صحيح' }, { status: 404 })
  }

  // توقيت السعودية = UTC+3
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = dayNames[now.getUTCDay()]

  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      *,
      campaign:campaigns(
        id, name, status, priority,
        campaign_media(
          id, order_num, fit_mode, object_position, transform,
          media(id, file_name, file_url, file_type, duration_sec)
        )
      )
    `)
    .eq('screen_id', screen.id)
    .lte('start_time', currentTime)
    .gte('end_time', currentTime)

  // جمع الحملات النشطة مع إعلاناتها وأوزانها
  type CampEntry = { items: any[]; weight: number; priority: string }
  const campEntries: CampEntry[] = []

  if (schedules && schedules.length > 0) {
    for (const schedule of schedules) {
      const campaign = schedule.campaign
      if (!campaign || campaign.status !== 'active') continue
      if (!schedule.days_of_week?.includes(today)) continue
      const mediaItems = [...(campaign.campaign_media || [])]
      mediaItems.sort((a: any, b: any) => a.order_num - b.order_num)
      const items = mediaItems
        .filter((item: any) => item.media)
        .map((item: any) => ({
          ...item.media,
          duration_sec: schedule.duration_sec || item.media.duration_sec || 15,
          fit_mode: item.fit_mode || screen.fit_mode || 'cover',
          object_position: item.object_position || 'center center',
          transform: item.transform || null,
        }))
      if (items.length > 0) {
        campEntries.push({ items, weight: schedule.weight ?? 100, priority: campaign.priority || 'normal' })
      }
    }
  }

  // ترتيب حسب الأولوية
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2 }
  campEntries.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))

  // توزيع النسب — خوارزمية Bresenham للتوزيع المتوازن
  let playlist: any[] = []
  if (campEntries.length === 1) {
    playlist = campEntries[0].items
  } else if (campEntries.length > 1) {
    const totalWeight = campEntries.reduce((s, e) => s + e.weight, 0)
    const POOL = 20 // عدد المقاعد الكلي في الدورة
    // احسب عدد المقاعد لكل حملة
    const slots = campEntries.map(e => ({
      ...e,
      slots: Math.max(1, Math.round((e.weight / totalWeight) * POOL)),
    }))
    // أنشئ قائمة ممتدة لكل حملة (كرّر الإعلانات لتملأ المقاعد)
    const expanded = slots.map(e => {
      const result: any[] = []
      for (let i = 0; i < e.slots; i++) result.push(e.items[i % e.items.length])
      return result
    })
    // دمج بالتناوب (interleave)
    const maxLen = Math.max(...expanded.map(e => e.length))
    for (let i = 0; i < maxLen; i++) {
      for (const list of expanded) {
        if (i < list.length) playlist.push(list[i])
      }
    }
  }

  await supabase
    .from('screens')
    .update({ status: 'online', last_seen: new Date().toISOString() })
    .eq('id', screen.id)

  return NextResponse.json({
    screenId: screen.id,
    screenName: screen.name,
    orientation: screen.orientation || 'landscape',
    fitMode: screen.fit_mode || 'cover',
    playlist,
    _debug: {
      currentTime,
      today,
      schedulesFound: schedules?.length ?? 0,
      schedules: (schedules || []).map((s: any) => ({
        id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        days_of_week: s.days_of_week,
        campaign_status: s.campaign?.status,
        media_count: s.campaign?.campaign_media?.length ?? 0,
        dayMatch: s.days_of_week?.includes(today),
        timeMatch: s.start_time <= currentTime && s.end_time >= currentTime,
      }))
    }
  })
}
