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
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('clients')
    .select('portal_token, company_name')
    .ilike('email', email.trim())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'لم نجد حساباً بهذا البريد الإلكتروني' }, { status: 404 })
  }

  if (!data.portal_token) {
    return NextResponse.json({ error: 'البوابة غير مفعّلة لهذا الحساب، تواصل مع Shelfy' }, { status: 403 })
  }

  return NextResponse.json({ token: data.portal_token, name: data.company_name })
}
