import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// جلب الإعدادات
export async function GET() {
  const { data } = await getSupabase()
    .from('app_settings')
    .select('key, value')

  const settings: Record<string, string> = {}
  ;(data || []).forEach((r: any) => { settings[r.key] = r.value })
  return NextResponse.json(settings)
}

// حفظ إعداد
export async function POST(req: NextRequest) {
  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'key مطلوب' }, { status: 400 })

  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from('app_settings')
    .select('id')
    .eq('key', key)
    .single()

  if (existing) {
    await supabase.from('app_settings').update({ value }).eq('key', key)
  } else {
    await supabase.from('app_settings').insert({ key, value })
  }

  return NextResponse.json({ success: true })
}
