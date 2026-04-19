import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function genPairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 7; i++) {
    if (i === 3) code += '-'
    else code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const { tempCode, name, locationName, orientation, deviceType } = await req.json()

  if (!tempCode || !name || !locationName) {
    return NextResponse.json({ error: 'tempCode واسم الشاشة والموقع مطلوبة' }, { status: 400 })
  }

  const supabase = getSupabase()

  // تحقق من الكود المؤقت
  const { data: pairing, error: pairError } = await supabase
    .from('pairing_requests')
    .select('id, status, expires_at')
    .eq('temp_code', tempCode.toUpperCase())
    .single()

  if (pairError || !pairing) {
    return NextResponse.json({ error: 'كود الربط غير صحيح' }, { status: 404 })
  }
  if (pairing.status === 'confirmed') {
    return NextResponse.json({ error: 'هذا الكود تم ربطه مسبقاً' }, { status: 400 })
  }
  if (new Date(pairing.expires_at) < new Date()) {
    return NextResponse.json({ error: 'انتهت صلاحية الكود' }, { status: 400 })
  }

  // أنشئ pair_code فريد
  const pairCode = genPairCode()

  // أنشئ الشاشة
  const { data: screen, error: screenError } = await supabase
    .from('screens')
    .insert({
      name,
      location_name: locationName,
      pair_code: pairCode,
      orientation: orientation || 'landscape',
      device_type: deviceType || 'android_stick',
      status: 'offline',
    })
    .select('id')
    .single()

  if (screenError || !screen) {
    return NextResponse.json({ error: screenError?.message || 'فشل إنشاء الشاشة' }, { status: 500 })
  }

  // حدّث الكود المؤقت
  await supabase
    .from('pairing_requests')
    .update({ status: 'confirmed', pair_code: pairCode, screen_id: screen.id })
    .eq('id', pairing.id)

  return NextResponse.json({ success: true, pairCode, screenId: screen.id })
}
