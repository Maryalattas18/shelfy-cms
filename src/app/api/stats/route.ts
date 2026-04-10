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

  // ─── إحصائيات الداشبورد ───────────────────────────
  if (type === 'dashboard') {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      { data: monthLogs },
      { data: allCampaigns },
      { data: allScreens },
    ] = await Promise.all([
      supabase.from('play_logs').select('id').gte('played_at', monthStart),
      supabase.from('campaigns').select('id, status'),
      supabase.from('screens').select('id, status'),
    ])

    return NextResponse.json({
      monthlyPlays: (monthLogs || []).length,
      activeCampaigns: (allCampaigns || []).filter((c: any) => c.status === 'active').length,
      totalScreens: (allScreens || []).length,
      onlineScreens: (allScreens || []).filter((s: any) => s.status === 'online').length,
    })
  }

  // ─── تقرير شهري ──────────────────────────────────
  if (type === 'monthly') {
    const month = req.nextUrl.searchParams.get('month') // YYYY-MM
    if (!month) return NextResponse.json({ error: 'month مطلوب' }, { status: 400 })

    const [year, mon] = month.split('-').map(Number)
    const start = new Date(year, mon - 1, 1).toISOString().split('T')[0]
    const end = new Date(year, mon, 0).toISOString().split('T')[0] // آخر يوم في الشهر

    const [
      { data: campaigns },
      { data: clients },
      { data: logs },
    ] = await Promise.all([
      supabase
        .from('campaigns')
        .select('id, name, status, price, start_date, end_date, client_id, clients(company_name)')
        .or(`start_date.lte.${end},end_date.gte.${start}`)
        .order('start_date', { ascending: true }),
      supabase.from('clients').select('id, company_name'),
      supabase
        .from('play_logs')
        .select('screen_id, duration_sec, media_id')
        .gte('played_at', `${start}T00:00:00`)
        .lte('played_at', `${end}T23:59:59`),
    ])

    const allCampaigns = campaigns || []
    const allClients = clients || []
    const allLogs = logs || []

    // إجمالي الإيرادات
    const totalRevenue = allCampaigns.reduce((s: number, c: any) => s + Number(c.price || 0), 0)
    const activeCampaigns = allCampaigns.filter((c: any) => c.status === 'active').length
    const endedCampaigns = allCampaigns.filter((c: any) => c.status === 'ended').length
    const totalPlays = allLogs.length
    const totalSec = allLogs.reduce((s: number, l: any) => s + (l.duration_sec || 0), 0)
    const totalHours = parseFloat((totalSec / 3600).toFixed(1))

    // الإيرادات حسب العميل
    const clientRevMap: Record<string, { name: string; revenue: number; campaigns: any[] }> = {}
    allCampaigns.forEach((c: any) => {
      const clientId = c.client_id
      if (!clientId) return
      const clientName = (c.clients as any)?.company_name || allClients.find((cl: any) => cl.id === clientId)?.company_name || '—'
      if (!clientRevMap[clientId]) clientRevMap[clientId] = { name: clientName, revenue: 0, campaigns: [] }
      clientRevMap[clientId].revenue += Number(c.price || 0)
      clientRevMap[clientId].campaigns.push(c)
    })
    const clientBreakdown = Object.values(clientRevMap).sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json({
      month,
      totalRevenue,
      totalCampaigns: allCampaigns.length,
      activeCampaigns,
      endedCampaigns,
      totalPlays,
      totalHours,
      campaigns: allCampaigns,
      clientBreakdown,
    })
  }

  return NextResponse.json({ error: 'type غير معروف' }, { status: 400 })
}
