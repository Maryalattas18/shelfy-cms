import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCampaignStartEmail({
  to,
  clientName,
  campaignName,
  portalUrl,
}: {
  to: string
  clientName: string
  campaignName: string
  portalUrl: string
}) {
  await resend.emails.send({
    from: 'Shelfy Screens <noreply@shelfyscreens.com>',
    to,
    subject: `حملتك الإعلانية "${campaignName}" بدأت الآن 🎉`,
    html: `
      <div dir="rtl" style="font-family:Cairo,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f7f8fa;padding:32px 16px">
        <div style="background:white;border-radius:16px;overflow:hidden;border:1px solid #ebebea">

          <!-- Header -->
          <div style="background:#0e1117;padding:24px 28px;text-align:center">
            <img src="https://shelfyscreens.com/shelfy-logo.png" height="48" style="object-fit:contain" alt="Shelfy"/>
          </div>

          <!-- Body -->
          <div style="padding:28px">
            <h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:6px">مرحباً ${clientName} 👋</h2>
            <p style="font-size:14px;color:#666;line-height:1.8;margin-bottom:20px">
              يسعدنا إعلامكم بأن حملتكم الإعلانية قد بدأت الآن على شاشات Shelfy!
            </p>

            <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 18px;margin-bottom:24px">
              <div style="font-size:12px;color:#3b82f6;font-weight:600;margin-bottom:4px">الحملة النشطة</div>
              <div style="font-size:18px;font-weight:700;color:#111">${campaignName}</div>
            </div>

            <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#378ADD,#185FA5);color:white;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:700;margin-bottom:16px">
              تابع أداء حملتك
            </a>

            <p style="font-size:12px;color:#aaa;text-align:center;margin-top:16px">
              لأي استفسار تواصل معنا عبر واتساب أو البريد الإلكتروني
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#fafaf8;border-top:1px solid #f0f0ee;padding:16px 28px;text-align:center">
            <p style="font-size:11px;color:#bbb;margin:0">Shelfy Screens · shelfyscreens.com</p>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendCampaignEndEmail({
  to,
  clientName,
  campaignName,
  portalUrl,
}: {
  to: string
  clientName: string
  campaignName: string
  portalUrl: string
}) {
  await resend.emails.send({
    from: 'Shelfy Screens <noreply@shelfyscreens.com>',
    to,
    subject: `حملتك الإعلانية "${campaignName}" اكتملت بنجاح ✅`,
    html: `
      <div dir="rtl" style="font-family:Cairo,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f7f8fa;padding:32px 16px">
        <div style="background:white;border-radius:16px;overflow:hidden;border:1px solid #ebebea">

          <!-- Header -->
          <div style="background:#0e1117;padding:24px 28px;text-align:center">
            <img src="https://shelfyscreens.com/shelfy-logo.png" height="48" style="object-fit:contain" alt="Shelfy"/>
          </div>

          <!-- Body -->
          <div style="padding:28px">
            <h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:6px">شكراً لثقتكم ${clientName} 🙏</h2>
            <p style="font-size:14px;color:#666;line-height:1.8;margin-bottom:20px">
              اكتملت حملتكم الإعلانية بنجاح. يمكنكم الاطلاع على تقرير الأداء من بوابتكم الخاصة.
            </p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 18px;margin-bottom:24px">
              <div style="font-size:12px;color:#16a34a;font-weight:600;margin-bottom:4px">الحملة المكتملة</div>
              <div style="font-size:18px;font-weight:700;color:#111">${campaignName}</div>
            </div>

            <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#378ADD,#185FA5);color:white;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:700;margin-bottom:16px">
              عرض تقرير الحملة
            </a>

            <p style="font-size:13px;color:#555;text-align:center;line-height:1.7">
              نتطلع لخدمتكم مجدداً — تواصل معنا لإطلاق حملتك القادمة
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#fafaf8;border-top:1px solid #f0f0ee;padding:16px 28px;text-align:center">
            <p style="font-size:11px;color:#bbb;margin:0">Shelfy Screens · shelfyscreens.com</p>
          </div>
        </div>
      </div>
    `,
  })
}
