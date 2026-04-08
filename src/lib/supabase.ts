import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getClients() {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function createClient_(client: { company_name: string, type: string, email: string, phone: string }) {
  const { data, error } = await supabase.from('clients').insert(client).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateClient(id: string, updates: any) {
  const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) console.error(error)
}

export async function getCampaigns() {
  const { data, error } = await supabase.from('campaigns').select('*, client:clients(*)').order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function createCampaign(campaign: any) {
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateCampaign(id: string, updates: any) {
  const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteCampaign_(id: string) {
  const { error } = await supabase.from('campaigns').delete().eq('id', id)
  if (error) console.error(error)
}

export async function getScreens() {
  const { data, error } = await supabase.from('screens').select('*, location:locations(*)').order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function createScreen(screen: any) {
  const { data, error } = await supabase.from('screens').insert(screen).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteScreen(id: string) {
  const { error } = await supabase.from('screens').delete().eq('id', id)
  if (error) console.error(error)
}

export async function getMedia() {
  const { data, error } = await supabase.from('media').select('*, client:clients(*)').order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function uploadMedia(file: File, clientId: string) {
  const fileName = `${Date.now()}_${file.name}`
  const filePath = `media/${clientId}/${fileName}`
  const { error: uploadError } = await supabase.storage.from('shelfy-media').upload(filePath, file)
  if (uploadError) { console.error(uploadError); return null }
  const { data: urlData } = supabase.storage.from('shelfy-media').getPublicUrl(filePath)
  const fileType = file.type.startsWith('video/') ? 'video' : 'image'
  const { data, error } = await supabase.from('media').insert({
    client_id: clientId,
    file_name: file.name,
    file_url: urlData.publicUrl,
    file_type: fileType,
    file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
    duration_sec: 15,
  }).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteMedia(id: string, fileUrl: string) {
  const path = fileUrl.split('/shelfy-media/')[1]
  if (path) await supabase.storage.from('shelfy-media').remove([path])
  await supabase.from('media').delete().eq('id', id)
}

