import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  try {
    if (action === 'suggest-campaign') {
      // اقتراح اسم + رسالة للحملة
      const { clientName, clientType, startDate, endDate } = body
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `أنت مساعد إعلاني محترف لشركة Shelfy للإعلانات الرقمية في السعودية.
العميل: ${clientName}
نوع النشاط: ${clientType === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}
الفترة: من ${startDate} إلى ${endDate}

اقترح:
1. اسم مختصر وجذاب للحملة (5 كلمات كحد أقصى)
2. رسالة إعلانية قصيرة تُعرض على الشاشة (جملة واحدة لا تتجاوز 10 كلمات)
3. توصية: هل الأولوية عادية أم عالية؟ ولماذا؟

أجب بـ JSON فقط بهذا الشكل:
{"name": "...", "message": "...", "priority": "normal|high", "reason": "..."}`
        }],
      })
      const text = (msg.content[0] as any).text
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
      return NextResponse.json(json)
    }

    if (action === 'analyze-client') {
      // تحليل العميل + مسودة رسالة
      const { clientName, clientType, totalRevenue, totalCampaigns, activeCampaigns, campaigns } = body
      const recentCamps = (campaigns || []).slice(0, 5).map((c: any) =>
        `${c.name} (${c.status}) - ${c.start_date} إلى ${c.end_date} - ${c.price} ر.س`
      ).join('\n')

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `أنت مستشار إعلاني لشركة Shelfy للإعلانات الرقمية في السعودية.

بيانات العميل:
- الاسم: ${clientName}
- نوع النشاط: ${clientType === 'brand' ? 'شركة منتجات' : 'ميني ماركت'}
- إجمالي الإنفاق: ${totalRevenue} ريال
- عدد الحملات: ${totalCampaigns}
- الحملات النشطة: ${activeCampaigns}
- آخر الحملات:
${recentCamps || 'لا يوجد'}

قدّم:
1. تحليل موجز للعميل (2-3 جمل)
2. توصية واحدة عملية لتحسين أداء إعلاناته
3. مسودة رسالة واتساب قصيرة ومهنية لإرسالها للعميل (3-4 جمل)

أجب بـ JSON فقط:
{"analysis": "...", "recommendation": "...", "whatsapp": "..."}`
        }],
      })
      const text = (msg.content[0] as any).text
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
      return NextResponse.json(json)
    }

    if (action === 'portal-summary') {
      // ملخص ذكي لبوابة العميل
      const { clientName, activeCampaigns, totalCampaigns, totalRevenue, campaigns } = body
      const activeCamps = (campaigns || []).filter((c: any) => c.status === 'active')
        .map((c: any) => `${c.name} (ينتهي ${c.end_date})`).join('، ')

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `أنت مساعد ودود في بوابة عملاء Shelfy للإعلانات الرقمية.

العميل: ${clientName}
الحملات النشطة: ${activeCampaigns} حملة${activeCamps ? ` (${activeCamps})` : ''}
إجمالي الحملات: ${totalCampaigns}
إجمالي الإنفاق: ${totalRevenue} ريال

اكتب رسالة ترحيبية قصيرة ومشجعة للعميل تُعرض في بوابته. جملتان أو ثلاث. بأسلوب احترافي وودود.
أجب بـ JSON فقط: {"summary": "..."}`
        }],
      })
      const text = (msg.content[0] as any).text
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
      return NextResponse.json(json)
    }

    return NextResponse.json({ error: 'action غير معروف' }, { status: 400 })
  } catch (e: any) {
    console.error('AI error:', e)
    return NextResponse.json({ error: e.message || 'حدث خطأ في الذكاء الاصطناعي' }, { status: 500 })
  }
}
