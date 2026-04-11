async function db(action: string, table: string, data?: any, id?: string, filter?: any): Promise<any> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, table, data, id, filter })
  })
  const json = await res.json()
  if (json.error) {
    console.error(`[supabase] ${action} ${table}:`, json.error)
    return null
  }
  return json.data
}

export async function getCampaignMedia(campaignId: string) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'select',
      table: 'campaign_media',
      data: '*, media(id,file_name,file_url,file_type,duration_sec,file_size_mb)',
      filter: { campaign_id: campaignId }
    })
  })
  const json = await res.json()
  return json.data || []
}

export async function getCampaignSchedules(campaignId: string) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'select',
      table: 'schedules',
      data: '*, screen:screens(id,name,location_name,status)',
      filter: { campaign_id: campaignId }
    })
  })
  const json = await res.json()
  return json.data || []
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
export async function updateCampaignMedia(id: string, updates: { fit_mode?: string; object_position?: string; transform?: any }) {
  return await db('update', 'campaign_media', updates, id)
}

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
      data: '*, campaign:campaigns(id,name,status), screen:screens(id,name,location_name)'
    })
  })
  const json = await res.json()
  return json.data || []
}

export async function createSchedule(schedule: {
  campaign_id: string
  screen_id: string
  start_time: string
  end_time: string
  days_of_week: string[]
  duration_sec: number
  weight?: number
}) {
  return await db('insert', 'schedules', schedule)
}

export async function deleteSchedule(id: string) {
  return await db('delete', 'schedules', null, id)
}

export async function updateSchedule(id: string, updates: any) {
  return await db('update', 'schedules', updates, id)
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
  const formData = new FormData()
  formData.append('file', file)
  formData.append('clientId', clientId)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
  const json = await res.json()
  if (json.error) {
    console.error('[uploadMedia]', json.error)
    return null
  }
  return json.data
}

export async function deleteMedia(id: string, fileUrl: string) {
  const path = fileUrl.split('/shelfy-media/')[1]
  if (path) {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  }
  return await db('delete', 'media', null, id)
}
