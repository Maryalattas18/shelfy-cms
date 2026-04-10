import { NextRequest, NextResponse } from 'next/server'
import { createSession, hashPassword } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getAdminPasswordHash(): Promise<string | null> {
  // تحقق أولاً من الإعدادات في Supabase (إذا تم التغيير من الداشبورد)
  try {
    const { data } = await getSupabase()
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single()
    if (data?.value) return data.value
  } catch {}
  // الرجوع لكلمة المرور الافتراضية من البيئة
  const envPass = process.env.ADMIN_PASSWORD
  if (!envPass) return null
  return hashPassword(envPass)
}

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 })

  const storedHash = await getAdminPasswordHash()
  if (!storedHash) return NextResponse.json({ error: 'ADMIN_PASSWORD غير محدد في البيئة' }, { status: 500 })

  const inputHash = await hashPassword(password)
  if (inputHash !== storedHash) {
    return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
  }

  const token = await createSession({ role: 'admin' })
  const res = NextResponse.json({ success: true })
  res.cookies.set('shelfy_admin', token, {
    httpOnly: true, secure: true,
    sameSite: 'lax', path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}

export async function PATCH(req: NextRequest) {
  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' }, { status: 400 })
  if (newPassword.length < 6)
    return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })

  const storedHash = await getAdminPasswordHash()
  if (!storedHash) return NextResponse.json({ error: 'ADMIN_PASSWORD غير محدد' }, { status: 500 })

  const inputHash = await hashPassword(currentPassword)
  if (inputHash !== storedHash)
    return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 })

  const newHash = await hashPassword(newPassword)
  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from('app_settings')
    .select('id')
    .eq('key', 'admin_password_hash')
    .single()

  if (existing) {
    await supabase.from('app_settings').update({ value: newHash }).eq('key', 'admin_password_hash')
  } else {
    await supabase.from('app_settings').insert({ key: 'admin_password_hash', value: newHash })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('shelfy_admin')
  return res
}
