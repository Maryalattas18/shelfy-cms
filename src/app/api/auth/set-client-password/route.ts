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

export async function POST(req: NextRequest) {
  const { clientId, password, email } = await req.json()
  if (!clientId || !password) return NextResponse.json({ error: 'مطلوب' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'كلمة المرور قصيرة جداً' }, { status: 400 })
  if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })

  const supabase = getSupabase()
  const hash = await hashPassword(password)

  const updates: any = { password_hash: hash }
  if (email) updates.email = email.trim().toLowerCase()

  const { error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
