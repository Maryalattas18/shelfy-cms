import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// يُستدعى يومياً من الداشبورد أو cron
export async function GET() {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  // حملات انتهت اليوم وحالتها لا تزال active
  const { data: ended } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('status', 'active')
    .lte('end_date', today)

  if (ended && ended.length > 0) {
    for (const c of ended) {
      // تحديث الحالة إلى ended
      await supabase.from('campaigns').update({ status: 'ended' }).eq('id', c.id)

      // إشعار
      await supabase.from('notifications').insert({
        type: 'campaign_ended',
        title: `انتهت حملة "${c.name}"`,
        body: 'تمت مدة الحملة — يمكنك تجديدها أو أرشفتها',
      })
    }
  }

  // حملات ستبدأ غداً وحالتها scheduled
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: starting } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('status', 'scheduled')
    .eq('start_date', tomorrowStr)

  if (starting && starting.length > 0) {
    for (const c of starting) {
      await supabase.from('notifications').insert({
        type: 'campaign_starting',
        title: `حملة "${c.name}" تبدأ غداً`,
        body: 'تأكد من رفع المحتوى وجدولة الشاشات',
      })
    }
  }

  return NextResponse.json({
    ended: ended?.length ?? 0,
    starting: starting?.length ?? 0,
  })
}
