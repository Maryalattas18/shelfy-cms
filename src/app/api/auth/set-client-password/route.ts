import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashPassword } from '@/lib/session'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  const { clientId, password: providedPw, email, autoGenerate } = await req.json()
  if (!clientId) return NextResponse.json({ error: 'مطلوب' }, { status: 400 })
  if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })

  const password = autoGenerate ? generatePassword() : providedPw
  if (!password || password.length < 6) return NextResponse.json({ error: 'كلمة المرور قصيرة جداً' }, { status: 400 })

  const supabase = getSupabase()
  const hash = await hashPassword(password)

  const { error } = await supabase
    .from('clients')
    .update({ password_hash: hash, portal_password_plain: password, email: email.trim().toLowerCase() })
    .eq('id', clientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, password })
}
