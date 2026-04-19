import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const tempCode = req.nextUrl.searchParams.get('temp')
  if (!tempCode) return NextResponse.json({ error: 'temp مطلوب' }, { status: 400 })

  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('pairing_requests')
    .select('status, pair_code, expires_at')
    .eq('temp_code', tempCode.toUpperCase())
    .single()

  if (error || !data) return NextResponse.json({ error: 'كود غير موجود' }, { status: 404 })

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ status: 'expired' })
  }

  return NextResponse.json({ status: data.status, pairCode: data.pair_code })
}
