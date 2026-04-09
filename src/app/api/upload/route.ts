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
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId') as string | null

    if (!file || !clientId) {
      return NextResponse.json({ error: 'file و clientId مطلوبان' }, { status: 400 })
    }

    const supabase = getSupabase()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `media/${clientId}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('shelfy-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] storage error:', uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data: urlData } = supabase.storage
      .from('shelfy-media')
      .getPublicUrl(filePath)

    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        client_id: clientId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type.startsWith('video/') ? 'video' : 'image',
        file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
        duration_sec: 15,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[upload] db error:', dbError.message)
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ data: mediaRecord })
  } catch (e: any) {
    console.error('[upload] error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { path } = await req.json()
    if (!path) return NextResponse.json({ error: 'path مطلوب' }, { status: 400 })

    const { error } = await getSupabase().storage.from('shelfy-media').remove([path])
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
