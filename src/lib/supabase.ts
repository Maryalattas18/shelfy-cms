async function db(action: string, table: string, data?: any, id?: string): Promise<any> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, table, data, id })
  })
  const json = await res.json()
  if (json.error) {
    console.error(`[supabase] ${action} ${table}:`, json.error)
    return null
  }
  return json.data
}

// ─── Clients ───────────────────────────────────────────────
export async function getClients() {
  return await db('select', 'clients') || []
}

export async function createClient_(client: any) {
  return await db('insert', 'clients', client)
}

export async function updateClient(id: string, updates: any) {
  return await db('update', 'clients', updates, id)
}

export async function deleteClient(id: string) {
  return await db('delete', 'clients', null, id)
}

// ─── Campaigns ─────────────────────────────────────────────
export async function getCampaigns() {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'select', table: 'campaigns', data: '*, client:clients(*)' })
  })
  const json = await res.json()
  return json.data || []
}

export async function createCampaign(campaign: any) {
  return await db('insert', 'campaigns', campaign)
}

export async function updateCampaign(id: string, updates: any) {
  return await db('update', 'campaigns', updates, id)
}

export async function deleteCampaign_(id: string) {
  return await db('delete', 'campaigns', null, id)
}

// ─── Campaign Media ─────────────────────────────────────────
export async function createCampaignMedia(campaignId: string, mediaIds: string[]) {
  const records = mediaIds.map((mediaId, i) => ({
    campaign_id: campaignId,
    media_id: mediaId,
    order_num: i + 1,
  }))
  return await db('insert_many', 'campaign_media', records)
}

// ─── Schedules ──────────────────────────────────────────────
export async function createSchedules(
  campaignId: string,
  screenIds: string[],
  startTime: string,
  endTime: string,
  daysOfWeek: string[],
  durationSec: number
) {
  const records = screenIds.map(screenId => ({
    campaign_id: campaignId,
    screen_id: screenId,
    start_time: startTime,
    end_time: endTime,
    days_of_week: daysOfWeek,
    duration_sec: durationSec,
  }))
  return await db('insert_many', 'schedules', records)
}

export async function getSchedules() {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'select',
      table: 'schedules',
      data: '*, campaign:campaigns(*), screen:screens(*)'
    })
  })
  const json = await res.json()
  return json.data || []
}

// ─── Screens ────────────────────────────────────────────────
export async function getScreens() {
  return await db('select', 'screens') || []
}

export async function createScreen(screen: any) {
  return await db('insert', 'screens', screen)
}

export async function updateScreen(id: string, updates: any) {
  return await db('update', 'screens', updates, id)
}

export async function deleteScreen(id: string) {
  return await db('delete', 'screens', null, id)
}

// ─── Media ──────────────────────────────────────────────────
export async function getMedia() {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'select', table: 'media', data: '*, client:clients(*)' })
  })
  const json = await res.json()
  return json.data || []
}

export async function uploadMedia(file: File, clientId: string) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const fileName = `${Date.now()}_${file.name}`
  const filePath = `media/${clientId}/${fileName}`
  const { error: uploadError } = await supabase.storage.from('shelfy-media').upload(filePath, file)
  if (uploadError) { console.error(uploadError); return null }
  const { data: urlData } = supabase.storage.from('shelfy-media').getPublicUrl(filePath)
  return await db('insert', 'media', {
    client_id: clientId,
    file_name: file.name,
    file_url: urlData.publicUrl,
    file_type: file.type.startsWith('video/') ? 'video' : 'image',
    file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
    duration_sec: 15,
  })
}

export async function deleteMedia(id: string, fileUrl: string) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const path = fileUrl.split('/shelfy-media/')[1]
  if (path) await supabase.storage.from('shelfy-media').remove([path])
  return await db('delete', 'media', null, id)
}
