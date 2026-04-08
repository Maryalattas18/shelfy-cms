import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(req: NextRequest) {
  const { screenId, status } = await req.json()
  if (!screenId) return NextResponse.json({ error: 'screenId مطلوب' }, { status: 400 })

  await supabase
    .from('screens')
    .update({ status, last_seen: new Date().toISOString() })
    .eq('id', screenId)

  return NextResponse.json({ success: true })
}

