import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  const info: Record<string, any> = {
    env: {
      SUPABASE_URL: url ? url.substring(0, 30) + '...' : 'MISSING',
      ANON_KEY: anonKey ? anonKey.substring(0, 20) + '...' : 'MISSING',
      SERVICE_KEY: serviceKey ? serviceKey.substring(0, 20) + '...' : 'MISSING',
    }
  }

  if (!url || !serviceKey) {
    return NextResponse.json({ ...info, error: 'env vars missing' }, { status: 500 })
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const tables = ['clients', 'campaigns', 'screens', 'media', 'schedules', 'campaign_media', 'play_logs']
    const tableStatus: Record<string, any> = {}

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      tableStatus[table] = error
        ? { error: error.message }
        : { count }
    }

    return NextResponse.json({ ...info, tables: tableStatus, status: 'ok' })
  } catch (e: any) {
    return NextResponse.json({ ...info, error: e.message }, { status: 500 })
  }
}
