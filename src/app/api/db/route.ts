import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error(`Missing env: URL=${!!url} KEY=${!!key}`)
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(req: NextRequest) {
  let supabase: ReturnType<typeof getSupabase>
  try {
    supabase = getSupabase()
  } catch (e: any) {
    console.error('[db] env error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  const { action, table, data, id } = await req.json()

  if (action === 'select') {
    // بعض الجداول لا تملك created_at
    const tablesWithoutCreatedAt = ['campaign_media']
    const hasCreatedAt = !tablesWithoutCreatedAt.includes(table)

    let query = supabase.from(table).select(data || '*')
    if (hasCreatedAt) query = query.order('created_at', { ascending: false }) as any

    const { data: rows, error } = await query
    if (error) {
      console.error(`[db] select ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: rows })
  }

  if (action === 'insert') {
    const { data: row, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    if (error) {
      console.error(`[db] insert ${table}:`, error.message, JSON.stringify(data))
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: row })
  }

  if (action === 'insert_many') {
    const { data: rows, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    if (error) {
      console.error(`[db] insert_many ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: rows })
  }

  if (action === 'update') {
    const { data: row, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error(`[db] update ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: row })
  }

  if (action === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      console.error(`[db] delete ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'action غير معروف' }, { status: 400 })
}
