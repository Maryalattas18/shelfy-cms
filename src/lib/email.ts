import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Shelfy Screens <noreply@shelfyscreens.com>'
const REPLY_TO = 'Sshelfyscreens@gmail.com'

/* ─── Email 1: Campaign Launch + Login Credentials ─── */
export async function sendCampaignLaunchEmail({
  to, clientName, campaignName, startDate, endDate,
  screensCount, portalUrl, email, password,
}: {
  to: string; clientName: string; campaignName: string
  startDate: string; endDate: string; screensCount: number
  portalUrl: string; email: string; password: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    reply_to: REPLY_TO,
    subject: `🎉 حملتك "${campaignName}" انطلقت! · Your campaign is LIVE!`,
    html: `
<div style="background:#f7f8fa;padding:32px 16px;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #ebebea">

  <!-- Header -->
  <div style="background:#0e1117;padding:28px 32px">
    <img src="https://shelfyscreens.com/shelfy-logo.png" height="44" alt="Shelfy" style="display:block;margin-bottom:12px"/>
    <div style="font-size:11px;color:#7ec8f5;letter-spacing:0.08em">CAMPAIGN LAUNCH NOTIFICATION · إشعار إطلاق الحملة</div>
  </div>

  <!-- Arabic Section -->
  <div dir="rtl" style="padding:28px 32px;border-bottom:2px dashed #f0f0ee">
    <h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:6px">مرحباً ${clientName} 👋</h2>
    <p style="font-size:14px;color:#666;line-height:1.8;margin-bottom:20px">
      يسعدنا إعلامكم بأن حملتكم الإعلانية قد انطلقت رسمياً على شاشات Shelfy!
    </p>

    <!-- Campaign Card -->
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin-bottom:20px">
      <div style="font-size:11px;color:#3b82f6;font-weight:600;margin-bottom:4px">تفاصيل الحملة</div>
      <div style="font-size:18px;font-weight:800;color:#111;margin-bottom:12px">${campaignName}</div>
      <div style="font-size:13px;color:#555;line-height:2">
        📅 <b>المدة:</b> ${startDate} — ${endDate}<br/>
        📺 <b>عدد الشاشات:</b> ${screensCount} شاشة
      </div>
    </div>

    <!-- Login Credentials -->
    <div style="background:#fafaf8;border:1px solid #ebebea;border-radius:12px;padding:18px 20px;margin-bottom:20px">
      <div style="font-size:11px;color:#888;font-weight:600;margin-bottom:10px">🔐 بيانات الدخول لبوابتكم</div>
      <div style="font-size:13px;color:#333;line-height:2.2">
        🌐 <b>الرابط:</b> <a href="${portalUrl}" style="color:#378ADD">shelfyscreens.com/portal-login</a><br/>
        📧 <b>البريد:</b> ${email}<br/>
        🔑 <b>كلمة المرور:</b> <span style="background:#111;color:#7ec8f5;padding:2px 10px;border-radius:4px;font-family:monospace;letter-spacing:0.1em">${password}</span>
      </div>
    </div>

    <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#378ADD,#185FA5);color:white;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:700">
      تابع حملتك الآن ←
    </a>
  </div>

  <!-- English Section -->
  <div dir="ltr" style="padding:28px 32px">
    <h2 style="font-size:18px;font-weight:700;color:#111;margin-bottom:6px">Hello ${clientName} 👋</h2>
    <p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:20px">
      We're excited to let you know your advertising campaign is now live on Shelfy Screens!
    </p>

    <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 18px;margin-bottom:18px">
      <div style="font-size:11px;color:#3b82f6;font-weight:600;margin-bottom:4px">CAMPAIGN DETAILS</div>
      <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:10px">${campaignName}</div>
      <div style="font-size:12px;color:#555;line-height:2">
        📅 <b>Duration:</b> ${startDate} — ${endDate}<br/>
        📺 <b>Screens:</b> ${screensCount}
      </div>
    </div>

    <div style="background:#fafaf8;border:1px solid #ebebea;border-radius:12px;padding:16px 18px;margin-bottom:18px">
      <div style="font-size:11px;color:#888;font-weight:600;margin-bottom:8px">🔐 YOUR PORTAL CREDENTIALS</div>
      <div style="font-size:12px;color:#333;line-height:2.2">
        🌐 <b>URL:</b> <a href="${portalUrl}" style="color:#378ADD">shelfyscreens.com/portal-login</a><br/>
        📧 <b>Email:</b> ${email}<br/>
        🔑 <b>Password:</b> <span style="background:#111;color:#7ec8f5;padding:2px 10px;border-radius:4px;font-family:monospace;letter-spacing:0.1em">${password}</span>
      </div>
    </div>

    <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#378ADD,#185FA5);color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:700">
      View Your Campaign →
    </a>
  </div>

  <!-- Footer -->
  <div style="background:#fafaf8;border-top:1px solid #f0f0ee;padding:14px 32px;text-align:center">
    <p style="font-size:11px;color:#bbb;margin:0">Shelfy Screens · shelfyscreens.com · نظام إعلانات الميني ماركت</p>
  </div>

</div>
</div>`,
  })
}

/* ─── Email 2: Campaign End Report + PDF ─── */
export async function sendCampaignEndEmail({
  to, clientName, campaignName, startDate, endDate,
  plays, hours, screensCount, mediaCount, portalUrl, pdfBuffer, price,
}: {
  to: string; clientName: string; campaignName: string
  startDate: string; endDate: string; plays: number; hours: number
  screensCount: number; mediaCount: number; portalUrl: string
  pdfBuffer: Buffer; price?: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    reply_to: REPLY_TO,
    subject: `✅ تقرير حملة "${campaignName}" · Campaign Report`,
    attachments: [{
      filename: `Shelfy-Report-${campaignName.replace(/\s+/g, '-')}.pdf`,
      content: pdfBuffer,
    }],
    html: `
<div style="background:#f7f8fa;padding:32px 16px;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #ebebea">

  <!-- Header -->
  <div style="background:#0e1117;padding:28px 32px">
    <img src="https://shelfyscreens.com/shelfy-logo.png" height="44" alt="Shelfy" style="display:block;margin-bottom:12px"/>
    <div style="font-size:11px;color:#7ec8f5;letter-spacing:0.08em">CAMPAIGN REPORT · تقرير الحملة</div>
  </div>

  <!-- Arabic Section -->
  <div dir="rtl" style="padding:28px 32px;border-bottom:2px dashed #f0f0ee">
    <h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:6px">شكراً لثقتكم ${clientName} 🙏</h2>
    <p style="font-size:14px;color:#666;line-height:1.8;margin-bottom:20px">
      اكتملت حملتكم الإعلانية بنجاح. يمكنكم الاطلاع على التقرير الكامل في المرفق.
    </p>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#378ADD">${plays.toLocaleString()}</div>
        <div style="font-size:11px;color:#888;margin-top:2px">مرة عرض · Plays</div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#16a34a">${hours}</div>
        <div style="font-size:11px;color:#888;margin-top:2px">ساعة بث · Hours</div>
      </div>
      <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#a16207">${screensCount}</div>
        <div style="font-size:11px;color:#888;margin-top:2px">شاشة · Screens</div>
      </div>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#7c3aed">${mediaCount}</div>
        <div style="font-size:11px;color:#888;margin-top:2px">ملف محتوى · Files</div>
      </div>
    </div>

    ${price ? `<div style="background:#fafaf8;border:1px solid #ebebea;border-radius:10px;padding:12px 16px;margin-bottom:16px;text-align:center;font-size:13px;color:#555">قيمة الحملة: <b style="color:#111">${price.toLocaleString()} ر.س</b></div>` : ''}

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#92400e">
      📎 التقرير الكامل مرفق بهذا الإيميل كملف PDF
    </div>

    <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#378ADD,#185FA5);color:white;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:700;margin-bottom:12px">
      عرض بوابتك ←
    </a>
    <p style="font-size:13px;color:#555;text-align:center">نتطلع لخدمتكم في حملتكم القادمة 🚀</p>
  </div>

  <!-- English Section -->
  <div dir="ltr" style="padding:28px 32px">
    <h2 style="font-size:18px;font-weight:700;color:#111;margin-bottom:6px">Thank you for choosing Shelfy, ${clientName}! 🙏</h2>
    <p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:20px">
      Your campaign has completed successfully. Please find the full performance report attached as a PDF.
    </p>

    <div style="background:#fafaf8;border:1px solid #ebebea;border-radius:10px;padding:14px 16px;margin-bottom:18px">
      <div style="font-size:11px;color:#888;font-weight:600;margin-bottom:8px">CAMPAIGN SUMMARY</div>
      <div style="font-size:12px;color:#333;line-height:2">
        📅 <b>Duration:</b> ${startDate} — ${endDate}<br/>
        ▶️ <b>Total Plays:</b> ${plays.toLocaleString()}<br/>
        ⏱ <b>Hours On Air:</b> ${hours} hrs<br/>
        📺 <b>Screens:</b> ${screensCount}
        ${price ? `<br/>💰 <b>Campaign Value:</b> ${price.toLocaleString()} SAR` : ''}
      </div>
    </div>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:12px;color:#92400e">
      📎 Full PDF report is attached to this email
    </div>

    <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#378ADD,#185FA5);color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:700;margin-bottom:12px">
      View Your Portal →
    </a>
    <p style="font-size:12px;color:#555;text-align:center">We look forward to serving you in your next campaign 🚀</p>
  </div>

  <!-- Footer -->
  <div style="background:#fafaf8;border-top:1px solid #f0f0ee;padding:14px 32px;text-align:center">
    <p style="font-size:11px;color:#bbb;margin:0">Shelfy Screens · shelfyscreens.com · نظام إعلانات الميني ماركت</p>
  </div>

</div>
</div>`,
  })
}
