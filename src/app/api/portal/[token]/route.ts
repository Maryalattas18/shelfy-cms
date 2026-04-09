import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = getSupabase()

  // جلب العميل عبر الـ token
  const { data: client, error } = await supabase
    .from('clients')
    .select('id, company_name, type, email, phone, created_at')
    .eq('portal_token', params.token)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'رابط غير صحيح أو منتهي الصلاحية' }, { status: 404 })
  }

  // جلب الحملات
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, start_date, end_date, price')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  const allCampaigns = campaigns || []

  // جلب الوسائط
  const { data: media } = await supabase
    .from('media')
    .select('id, file_name, file_url, file_type, duration_sec, file_size_mb, created_at')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  // جلب الإحصائيات من play_logs لكل حملة
  const campaignIds = allCampaigns.map((c: any) => c.id)
  let totalPlays = 0
  let totalSec = 0

  if (campaignIds.length > 0) {
    const { data: cm } = await supabase
      .from('campaign_media')
      .select('media_id')
      .in('campaign_id', campaignIds)

    const mediaIds = (cm || []).map((x: any) => x.media_id)

    if (mediaIds.length > 0) {
      const { data: logs } = await supabase
        .from('play_logs')
        .select('duration_sec')
        .in('media_id', mediaIds)

      totalPlays = (logs || []).length
      totalSec = (logs || []).reduce((s: number, l: any) => s + (l.duration_sec || 0), 0)
    }
  }

  // إحصائيات لكل حملة
  const campaignsWithStats = await Promise.all(
    allCampaigns.map(async (c: any) => {
      const { data: cm } = await supabase
        .from('campaign_media')
        .select('media_id')
        .eq('campaign_id', c.id)

      const mediaIds = (cm || []).map((x: any) => x.media_id)
      let plays = 0

      if (mediaIds.length > 0) {
        const { count } = await supabase
          .from('play_logs')
          .select('*', { count: 'exact', head: true })
          .in('media_id', mediaIds)
        plays = count || 0
      }

      return { ...c, plays }
    })
  )

  return NextResponse.json({
    client,
    stats: {
      totalPlays,
      totalHours: parseFloat((totalSec / 3600).toFixed(1)),
      campaignCount: allCampaigns.length,
      mediaCount: (media || []).length,
    },
    campaigns: campaignsWithStats,
    media: media || [],
  })
}
