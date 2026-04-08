async function db(action: string, table: string, data?: any, id?: string) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, table, data, id })
  })
  const json = await res.json()
  if (json.error) { console.error(json.error); return null }
  return json.data
}

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

export async function getScreens() {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'select', table: 'screens', data: '*, location:locations(*)' })
  })
  const json = await res.json()
  return json.data || []
}

export async function createScreen(screen: any) {
  return await db('insert', 'screens', screen)
}

export async function deleteScreen(id: string) {
  return await db('delete', 'screens', null, id)
}

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

