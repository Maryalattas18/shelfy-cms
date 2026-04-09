import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const { screenId, status } = await req.json()
  if (!screenId) return NextResponse.json({ error: 'screenId مطلوب' }, { status: 400 })

  const supabase = getSupabase()

  // اجلب الحالة القديمة
  const { data: screen } = await supabase
    .from('screens')
    .select('name, status')
    .eq('id', screenId)
    .single()

  // حدّث الحالة
  await supabase
    .from('screens')
    .update({ status, last_seen: new Date().toISOString() })
    .eq('id', screenId)

  // أنشئ إشعار فقط إذا تغيّرت الحالة
  if (screen && screen.status !== status) {
    const isOnline = status === 'online'
    await supabase.from('notifications').insert({
      type: isOnline ? 'screen_online' : 'screen_offline',
      title: isOnline
        ? `شاشة "${screen.name}" اتصلت`
        : `شاشة "${screen.name}" انقطعت`,
      body: isOnline
        ? 'الشاشة أصبحت متصلة وجاهزة للعرض'
        : 'الشاشة غير متصلة بالإنترنت',
    })
  }

  return NextResponse.json({ success: true })
}
