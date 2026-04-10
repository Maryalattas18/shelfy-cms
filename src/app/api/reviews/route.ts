import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// جلب تقييم حملة معينة
export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaignId')
  if (!campaignId) return NextResponse.json({ error: 'campaignId مطلوب' }, { status: 400 })

  const { data } = await getSupabase()
    .from('campaign_reviews')
    .select('*')
    .eq('campaign_id', campaignId)
    .single()

  return NextResponse.json(data || null)
}

// إضافة / تحديث تقييم
export async function POST(req: NextRequest) {
  const { campaign_id, rating, comment } = await req.json()
  if (!campaign_id || !rating) return NextResponse.json({ error: 'مطلوب' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'التقييم بين 1 و 5' }, { status: 400 })

  const supabase = getSupabase()

  // تحقق إذا يوجد تقييم سابق لنفس الحملة
  const { data: existing } = await supabase
    .from('campaign_reviews')
    .select('id')
    .eq('campaign_id', campaign_id)
    .single()

  if (existing) {
    await supabase.from('campaign_reviews').update({ rating, comment }).eq('id', existing.id)
  } else {
    await supabase.from('campaign_reviews').insert({ campaign_id, rating, comment })
  }

  return NextResponse.json({ success: true })
}
