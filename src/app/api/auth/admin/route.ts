import { NextRequest, NextResponse } from 'next/server'
import { createSession, hashPassword } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 })

  const adminPass = process.env.ADMIN_PASSWORD
  if (!adminPass) return NextResponse.json({ error: 'ADMIN_PASSWORD غير محدد في البيئة' }, { status: 500 })

  // هاش المدخل ومقارنته بهاش الباسورد المحفوظ
  const inputHash = await hashPassword(password)
  const storedHash = await hashPassword(adminPass)

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

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('shelfy_admin')
  return res
}
