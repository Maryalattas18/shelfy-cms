import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendCampaignStartEmail, sendCampaignEndEmail } from '@/lib/email'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  // ─── 1. حملات انتهت اليوم ────────────────────
  const { data: ended } = await supabase
    .from('campaigns')
    .select('id, name, client_id, clients(company_name, phone, email, portal_token)')
    .eq('status', 'active')
    .lte('end_date', today)

  if (ended && ended.length > 0) {
    for (const c of ended) {
      await supabase.from('campaigns').update({ status: 'ended' }).eq('id', c.id)

      const client = (c as any).clients
      const waMsg = client?.phone
        ? encodeURIComponent(`مرحباً ${client.company_name}،\n\nنود إعلامكم بأن حملتكم الإعلانية "${c.name}" قد اكتملت بنجاح.\n\nيسعدنا التواصل معكم لمناقشة تجديد الحملة أو إطلاق حملة جديدة.\n\nفريق Shelfy Screens`)
        : null

      // إرسال إيميل تلقائي
      if (client?.email) {
        try {
          await sendCampaignEndEmail({
            to: client.email,
            clientName: client.company_name,
            campaignName: c.name,
            portalUrl: client.portal_token ? `https://shelfyscreens.com/portal/${client.portal_token}` : 'https://shelfyscreens.com/portal-login',
          })
        } catch (e) { console.error('email error', e) }
      }

      await supabase.from('notifications').insert({
        type: 'campaign_ended',
        title: `انتهت حملة "${c.name}"`,
        body: `عميل: ${client?.company_name || '—'} · يمكنك تجديدها أو أرشفتها`,
        meta: waMsg && client?.phone ? { whatsapp: `https://wa.me/${client.phone.replace(/\D/g,'')}?text=${waMsg}` } : null,
      })
    }
  }

  // ─── 2. حملات ستبدأ غداً ─────────────────────
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: starting } = await supabase
    .from('campaigns')
    .select('id, name, client_id, clients(company_name, phone, email, portal_token)')
    .eq('status', 'scheduled')
    .eq('start_date', tomorrowStr)

  if (starting && starting.length > 0) {
    for (const c of starting) {
      await supabase.from('campaigns').update({ status: 'active' }).eq('id', c.id)

      const client = (c as any).clients
      const waMsg = client?.phone
        ? encodeURIComponent(`مرحباً ${client.company_name}،\n\nيسعدنا إعلامكم بأن حملتكم الإعلانية "${c.name}" ستبدأ غداً على شاشات Shelfy.\n\nيمكنكم متابعة أداء الحملة من بوابتكم الخاصة.\n\nفريق Shelfy Screens`)
        : null

      // إرسال إيميل تلقائي
      if (client?.email) {
        try {
          await sendCampaignStartEmail({
            to: client.email,
            clientName: client.company_name,
            campaignName: c.name,
            portalUrl: client.portal_token ? `https://shelfyscreens.com/portal/${client.portal_token}` : 'https://shelfyscreens.com/portal-login',
          })
        } catch (e) { console.error('email error', e) }
      }

      await supabase.from('notifications').insert({
        type: 'campaign_starting',
        title: `حملة "${c.name}" تبدأ غداً`,
        body: `عميل: ${client?.company_name || '—'} · تأكد من رفع المحتوى وجدولة الشاشات`,
        meta: waMsg && client?.phone ? { whatsapp: `https://wa.me/${client.phone.replace(/\D/g,'')}?text=${waMsg}` } : null,
      })
    }
  }

  // ─── 3. تذكيرات: حملات تنتهي خلال 3 أيام ────
  const in3Days = new Date()
  in3Days.setDate(in3Days.getDate() + 3)
  const in3DaysStr = in3Days.toISOString().split('T')[0]

  const { data: expiring } = await supabase
    .from('campaigns')
    .select('id, name, end_date, clients(company_name)')
    .eq('status', 'active')
    .eq('end_date', in3DaysStr)

  if (expiring && expiring.length > 0) {
    for (const c of expiring) {
      const client = (c as any).clients
      // تحقق إذا أُرسل تذكير لهذه الحملة اليوم
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'campaign_expiring')
        .ilike('title', `%${c.name}%`)
        .gte('created_at', today)
        .single()

      if (!existing) {
        await supabase.from('notifications').insert({
          type: 'campaign_expiring',
          title: `⚠️ حملة "${c.name}" تنتهي بعد 3 أيام`,
          body: `عميل: ${client?.company_name || '—'} · تاريخ الانتهاء: ${c.end_date}`,
        })
      }
    }
  }

  return NextResponse.json({
    ended: ended?.length ?? 0,
    starting: starting?.length ?? 0,
    expiring: expiring?.length ?? 0,
  })
}
