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
  const campaignId = req.nextUrl.searchParams.get('campaignId')
  if (!campaignId) return NextResponse.json([], { status: 400 })

  const { data } = await getSupabase()
    .from('campaign_logs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const { campaign_id, action, details } = await req.json()
  if (!campaign_id || !action) return NextResponse.json({ error: 'مطلوب' }, { status: 400 })

  await getSupabase()
    .from('campaign_logs')
    .insert({ campaign_id, action, details })

  return NextResponse.json({ success: true })
}
