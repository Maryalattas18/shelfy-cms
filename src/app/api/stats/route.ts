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
  const type = req.nextUrl.searchParams.get('type')
  const supabase = getSupabase()

  // ─── إحصائيات حملة معينة ─────────────────────────
  if (type === 'campaign') {
    const campaignId = req.nextUrl.searchParams.get('id')
    if (!campaignId) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })

    // جلب media IDs الخاصة بهذه الحملة
    const { data: cm } = await supabase
      .from('campaign_media')
      .select('media_id')
      .eq('campaign_id', campaignId)

    const mediaIds = (cm || []).map((x: any) => x.media_id)

    let playCount = 0
    let totalSec = 0
    let screenSet = new Set<string>()

    if (mediaIds.length > 0) {
      const { data: logs } = await supabase
        .from('play_logs')
        .select('screen_id, duration_sec')
        .in('media_id', mediaIds)

      playCount = (logs || []).length
      totalSec = (logs || []).reduce((s: number, l: any) => s + (l.duration_sec || 0), 0)
      ;(logs || []).forEach((l: any) => screenSet.add(l.screen_id))
    }

    // جلب عدد الجداول
    const { count: scheduleCount } = await supabase
      .from('schedules')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)

    return NextResponse.json({
      playCount,
      totalHours: parseFloat((totalSec / 3600).toFixed(1)),
      screenCount: screenSet.size,
      scheduleCount: scheduleCount || 0,
    })
  }

  // ─── إحصائيات عامة للتقارير ──────────────────────
  if (type === 'reports') {
    const [
      { data: logs },
      { data: screens },
      { data: campaigns },
      { data: clients },
    ] = await Promise.all([
      supabase.from('play_logs').select('screen_id, duration_sec, media_id'),
      supabase.from('screens').select('id, name, location_name, status'),
      supabase.from('campaigns').select('id, name, price, client_id, status'),
      supabase.from('clients').select('id, company_name'),
    ])

    const allLogs = logs || []
    const allScreens = screens || []
    const allCampaigns = campaigns || []
    const allClients = clients || []

    // إحصائيات عامة
    const totalPlays = allLogs.length
    const totalSec = allLogs.reduce((s: number, l: any) => s + (l.duration_sec || 0), 0)
    const totalHours = parseFloat((totalSec / 3600).toFixed(1))

    // أداء الشاشات: عدد مرات العرض لكل شاشة
    const screenPlays: Record<string, number> = {}
    allLogs.forEach((l: any) => {
      screenPlays[l.screen_id] = (screenPlays[l.screen_id] || 0) + 1
    })
    const maxPlays = Math.max(...Object.values(screenPlays), 1)
    const screenStats = allScreens.map((s: any) => ({
      id: s.id,
      name: s.name,
      location: s.location_name,
      status: s.status,
      plays: screenPlays[s.id] || 0,
      pct: Math.round(((screenPlays[s.id] || 0) / maxPlays) * 100),
    })).sort((a: any, b: any) => b.plays - a.plays)

    // الإيراد حسب العميل
    const clientRevenue: Record<string, number> = {}
    allCampaigns.forEach((c: any) => {
      if (c.client_id && c.price > 0) {
        clientRevenue[c.client_id] = (clientRevenue[c.client_id] || 0) + Number(c.price)
      }
    })
    const maxRev = Math.max(...Object.values(clientRevenue), 1)
    const clientStats = allClients
      .map((c: any) => ({
        id: c.id,
        name: c.company_name,
        revenue: clientRevenue[c.id] || 0,
        pct: Math.round(((clientRevenue[c.id] || 0) / maxRev) * 100),
      }))
      .filter((c: any) => c.revenue > 0)
      .sort((a: any, b: any) => b.revenue - a.revenue)

    // آخر 20 سجل عرض
    const { data: recentLogs } = await supabase
      .from('play_logs')
      .select('*, screen:screens(name), media:media(file_name, file_type)')
      .order('played_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      totalPlays,
      totalHours,
      activeScreens: allScreens.filter((s: any) => s.status === 'online').length,
      totalScreens: allScreens.length,
      screenStats,
      clientStats,
      recentLogs: recentLogs || [],
    })
  }

  return NextResponse.json({ error: 'type غير معروف' }, { status: 400 })
}
