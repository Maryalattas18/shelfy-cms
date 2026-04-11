import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendCampaignLaunchEmail, sendCampaignEndEmail } from '@/lib/email'
import { generateCampaignPdf } from '@/lib/campaignPdf'

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
    .select('id, name, start_date, end_date, price, client_id, clients(company_name, phone, email, portal_token)')
    .eq('status', 'active')
    .lte('end_date', today)

  if (ended && ended.length > 0) {
    for (const c of ended) {
      await supabase.from('campaigns').update({ status: 'ended' }).eq('id', c.id)

      const client = (c as any).clients
      const waMsg = client?.phone
        ? encodeURIComponent(`مرحباً ${client.company_name}،\n\nنود إعلامكم بأن حملتكم الإعلانية "${c.name}" قد اكتملت بنجاح.\n\nيسعدنا التواصل معكم لمناقشة تجديد الحملة أو إطلاق حملة جديدة.\n\nفريق Shelfy Screens`)
        : null

      if (client?.email) {
        try {
          // جلب إحصائيات الحملة
          const { data: cm } = await supabase.from('campaign_media').select('media_id').eq('campaign_id', c.id)
          const mediaIds = (cm || []).map((x: any) => x.media_id)
          let plays = 0, totalSec = 0
          if (mediaIds.length > 0) {
            const { data: logs } = await supabase.from('play_logs').select('duration_sec').in('media_id', mediaIds)
            plays = (logs || []).length
            totalSec = (logs || []).reduce((s: number, l: any) => s + (l.duration_sec || 0), 0)
          }

          // جلب الشاشات
          const { data: schedules } = await supabase.from('schedules').select('screen:screens(name,location_name)').eq('campaign_id', c.id)
          const screens = (schedules || []).map((s: any) => s.screen).filter(Boolean)

          const hours = parseFloat((totalSec / 3600).toFixed(1))
          const portalUrl = client.portal_token ? `https://shelfyscreens.com/portal/${client.portal_token}` : 'https://shelfyscreens.com/portal-login'

          // توليد PDF (اختياري - لا يوقف الإيميل لو فشل)
          let pdfBuffer: Buffer | undefined
          try {
            pdfBuffer = await generateCampaignPdf({
              clientName: client.company_name,
              campaignName: c.name,
              startDate: c.start_date,
              endDate: c.end_date,
              plays, hours,
              screensCount: screens.length,
              screens,
              mediaCount: mediaIds.length,
              price: c.price,
            })
          } catch (pdfErr) {
            console.error('PDF generation failed (email will still send):', pdfErr)
          }

          await sendCampaignEndEmail({
            to: client.email,
            clientName: client.company_name,
            campaignName: c.name,
            startDate: c.start_date,
            endDate: c.end_date,
            plays, hours,
            screensCount: screens.length,
            mediaCount: mediaIds.length,
            portalUrl,
            pdfBuffer,
            price: c.price,
          })
        } catch (e) { console.error('end email error', e) }
      }

      await supabase.from('notifications').insert({
        type: 'campaign_ended',
        title: `انتهت حملة "${c.name}"`,
        body: `عميل: ${client?.company_name || '—'} · يمكنك تجديدها أو أرشفتها`,
        meta: waMsg && client?.phone ? { whatsapp: `https://wa.me/${client.phone.replace(/\D/g,'')}?text=${waMsg}` } : null,
      })
    }
  }

  // ─── 2. حملات تبدأ اليوم ─────────────────────
  const { data: starting } = await supabase
    .from('campaigns')
    .select('id, name, start_date, end_date, client_id, clients(id, company_name, phone, email, portal_token, portal_password_plain)')
    .eq('status', 'scheduled')
    .eq('start_date', today)

  if (starting && starting.length > 0) {
    for (const c of starting) {
      await supabase.from('campaigns').update({ status: 'active' }).eq('id', c.id)

      const client = (c as any).clients
      const waMsg = client?.phone
        ? encodeURIComponent(`مرحباً ${client.company_name}،\n\nيسعدنا إعلامكم بأن حملتكم الإعلانية "${c.name}" بدأت اليوم على شاشات Shelfy.\n\nيمكنكم متابعة أداء الحملة من بوابتكم الخاصة.\n\nفريق Shelfy Screens`)
        : null

      if (client?.email) {
        try {
          // جلب عدد الشاشات
          const { data: schedules } = await supabase.from('schedules').select('id').eq('campaign_id', c.id)
          const portalUrl = client.portal_token ? `https://shelfyscreens.com/portal/${client.portal_token}` : 'https://shelfyscreens.com/portal-login'

          await sendCampaignLaunchEmail({
            to: client.email,
            clientName: client.company_name,
            campaignName: c.name,
            startDate: c.start_date,
            endDate: c.end_date,
            screensCount: (schedules || []).length,
            portalUrl,
            email: client.email,
            password: client.portal_password_plain || '—',
          })
        } catch (e) { console.error('launch email error', e) }
      }

      await supabase.from('notifications').insert({
        type: 'campaign_starting',
        title: `حملة "${c.name}" بدأت اليوم`,
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
      const { data: existing } = await supabase
        .from('notifications').select('id')
        .eq('type', 'campaign_expiring')
        .ilike('title', `%${c.name}%`)
        .gte('created_at', today).single()

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
