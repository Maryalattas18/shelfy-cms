import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error(`Missing env: URL=${!!url} KEY=${!!key}`)
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// الجداول التي لا تملك created_at — يُحدَّد عمود الترتيب البديل
const ORDER_COL: Record<string, string | null> = {
  campaign_media: null,       // لا ترتيب
  play_logs:      'played_at', // يستخدم played_at
}

export async function POST(req: NextRequest) {
  let supabase: ReturnType<typeof getSupabase>
  try { supabase = getSupabase() }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }

  const { action, table, data, id, filter } = await req.json()

  // ─── SELECT ────────────────────────────────────────
  if (action === 'select') {
    let query = supabase.from(table).select(data || '*')

    // تطبيق فلتر اختياري { column: value }
    if (filter && typeof filter === 'object') {
      for (const [col, val] of Object.entries(filter)) {
        if (Array.isArray(val)) {
          query = query.in(col, val) as any
        } else {
          query = query.eq(col, val) as any
        }
      }
    }

    // ترتيب حسب العمود الصحيح
    const orderCol = table in ORDER_COL ? ORDER_COL[table] : 'created_at'
    if (orderCol) query = query.order(orderCol, { ascending: false }) as any

    const { data: rows, error } = await query
    if (error) {
      console.error(`[db] select ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: rows })
  }

  // ─── INSERT ────────────────────────────────────────
  if (action === 'insert') {
    const { data: row, error } = await supabase.from(table).insert(data).select().single()
    if (error) {
      console.error(`[db] insert ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: row })
  }

  // ─── INSERT MANY ───────────────────────────────────
  if (action === 'insert_many') {
    const { data: rows, error } = await supabase.from(table).insert(data).select()
    if (error) {
      console.error(`[db] insert_many ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: rows })
  }

  // ─── UPDATE ────────────────────────────────────────
  if (action === 'update') {
    const { data: row, error } = await supabase.from(table).update(data).eq('id', id).select().single()
    if (error) {
      console.error(`[db] update ${table}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data: row })
  }

  // ─── DELETE ────────────────────────────────────────
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
