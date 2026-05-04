import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// حساب الإعلان الحالي بناءً على الوقت — نفس الخوارزمية في الـ player
function calcCurrentItem(playlist: any[]): any {
  if (!playlist.length) return null
  const totalMs = playlist.reduce((s: number, it: any) => s + (it.duration_sec || 15) * 1000, 0)
  if (!totalMs) return playlist[0]
  const nowMs = Date.now()
  // مرجع: منتصف الليل بتوقيت السعودية (UTC+3)
  const saudiMs = nowMs + 3 * 3600000
  const dayMs = Math.floor(saudiMs / 86400000) * 86400000
  const midnightUtc = dayMs - 3 * 3600000
  const pos = (nowMs - midnightUtc) % totalMs
  let acc = 0
  for (const item of playlist) {
    const dur = (item.duration_sec || 15) * 1000
    if (pos < acc + dur) return item
    acc += dur
  }
  return playlist[0]
}

// GET /api/screen-now?ids=id1,id2,id3
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids')
  if (!idsParam) return NextResponse.json({})
  const ids = idsParam.split(',').filter(Boolean)
  if (!ids.length) return NextResponse.json({})

  const supabase = getSupabase()

  const now = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = dayNames[now.getUTCDay()]

  const { data: screens } = await supabase
    .from('screens')
    .select('id, fit_mode')
    .in('id', ids)

  if (!screens) return NextResponse.json({})

  const result: Record<string, any> = {}

  for (const screen of screens) {
    const { data: schedules } = await supabase
      .from('schedules')
      .select(`
        duration_sec, weight, days_of_week,
        campaign:campaigns(
          id, status, priority, created_at,
          campaign_media(
            id, order_num, fit_mode, object_position, transform,
            media(id, file_name, file_url, file_type, duration_sec)
          )
        )
      `)
      .eq('screen_id', screen.id)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)

    type CampEntry = { items: any[]; weight: number; priority: string; createdAt: string }
    const campEntries: CampEntry[] = []

    if (schedules) {
      for (const sched of schedules) {
        const campaign = sched.campaign as any
        if (!campaign || campaign.status !== 'active') continue
        if (!sched.days_of_week?.includes(today)) continue
        const mediaItems = [...(campaign.campaign_media || [])].sort((a: any, b: any) => a.order_num - b.order_num)
        const items = mediaItems
          .filter((item: any) => item.media)
          .map((item: any) => ({
            ...item.media,
            duration_sec: sched.duration_sec || item.media.duration_sec || 15,
            fit_mode: item.fit_mode || screen.fit_mode || 'cover',
            object_position: item.object_position || 'center center',
            transform: item.transform || null,
          }))
        if (items.length > 0) {
          campEntries.push({
            items,
            weight: (sched as any).weight ?? 100,
            priority: campaign.priority || 'normal',
            createdAt: campaign.created_at || '',
          })
        }
      }
    }

    // بناء الـ playlist (نفس منطق /api/playlist)
    let playlist: any[] = []
    if (campEntries.length === 1) {
      playlist = campEntries[0].items
    } else if (campEntries.length > 1) {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2 }
      campEntries.sort((a, b) => {
        const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
        if (pDiff !== 0) return pDiff
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
      const totalWeight = campEntries.reduce((s, e) => s + e.weight, 0)
      const POOL = 20
      const slots = campEntries.map(e => ({
        ...e,
        slots: Math.max(1, Math.round((e.weight / totalWeight) * POOL)),
      }))
      const expanded = slots.map(e => {
        const r: any[] = []
        for (let i = 0; i < e.slots; i++) r.push(e.items[i % e.items.length])
        return r
      })
      const maxLen = Math.max(...expanded.map(e => e.length))
      for (let i = 0; i < maxLen; i++) {
        for (const list of expanded) {
          if (i < list.length) playlist.push(list[i])
        }
      }
    }

    const currentItem = calcCurrentItem(playlist)
    result[screen.id] = currentItem
      ? { media: currentItem, playlist, serverTime: Date.now() }
      : { media: null, playlist: [], serverTime: Date.now() }
  }

  return NextResponse.json(result)
}
