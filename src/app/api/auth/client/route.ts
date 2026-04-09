import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSession, hashPassword } from '@/lib/session'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// تسجيل الدخول
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('clients')
    .select('portal_token, company_name, password_hash')
    .ilike('email', email.trim().toLowerCase())
    .single()

  if (error || !data) return NextResponse.json({ error: 'البريد الإلكتروني غير مسجّل' }, { status: 404 })
  if (!data.password_hash) return NextResponse.json({ error: 'لم يتم تفعيل الحساب بعد، تواصل مع Shelfy' }, { status: 403 })

  const inputHash = await hashPassword(password)
  if (inputHash !== data.password_hash) return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })

  const sessionToken = await createSession({ token: data.portal_token, email })
  const res = NextResponse.json({ token: data.portal_token, name: data.company_name })
  res.cookies.set('shelfy_client', sessionToken, {
    httpOnly: true, secure: true,
    sameSite: 'lax', path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}

// تغيير كلمة المرور
export async function PATCH(req: NextRequest) {
  const { email, currentPassword, newPassword } = await req.json()
  if (!email || !currentPassword || !newPassword) return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })

  const { data } = await getSupabase()
    .from('clients')
    .select('id, password_hash')
    .ilike('email', email.trim())
    .single()

  if (!data) return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })

  const currentHash = await hashPassword(currentPassword)
  if (currentHash !== data.password_hash) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 })

  const newHash = await hashPassword(newPassword)
  await getSupabase().from('clients').update({ password_hash: newHash }).eq('id', data.id)

  return NextResponse.json({ success: true })
}
