import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const mockData = {
  stats: { screens: { total: 4, online: 2 }, campaigns: { active: 3 }, clients: { total: 5 }, plays: { thisMonth: 4832 } },
  campaigns: [
    { id: '1', name: 'رمضان 2026', client: { company_name: 'بيبسي' }, status: 'active', start_date: '2026-03-01', end_date: '2026-03-30', price: 4800 },
    { id: '2', name: 'عروض الصيف', client: { company_name: 'نستله' }, status: 'active', start_date: '2026-03-15', end_date: '2026-05-15', price: 3900 },
    { id: '3', name: 'منتج جديد', client: { company_name: 'أرامكو' }, status: 'scheduled', start_date: '2026-04-10', end_date: '2026-05-10', price: 2100 },
    { id: '4', name: 'تخفيضات مايو', client: { company_name: 'الكيلو' }, status: 'draft', start_date: '2026-05-01', end_date: '2026-05-31', price: 2800 },
  ],
  screens: [
    { id: 's1', name: 'شاشة العليا — 01', location: { name: 'م. الأندلس' }, status: 'online', last_seen: 'منذ 2 دقيقة', pair_code: 'XK7-49M' },
    { id: 's2', name: 'شاشة النرجس — 02', location: { name: 'م. الريم' }, status: 'online', last_seen: 'منذ 5 دقائق', pair_code: 'MR3-77X' },
    { id: 's3', name: 'شاشة الملقا — 03', location: { name: 'م. النخيل' }, status: 'idle', last_seen: 'منذ ساعة', pair_code: 'PL8-22Z' },
    { id: 's4', name: 'شاشة الروضة — 04', location: { name: 'م. الزيتون' }, status: 'offline', last_seen: 'منذ 3 ساعات', pair_code: 'QT5-91B' },
  ],
  clients: [
    { id: 'c1', company_name: 'بيبسي', type: 'brand', email: 'ahmed@pepsi.com', phone: '0501112233', balance: 4800 },
    { id: 'c2', company_name: 'نستله', type: 'brand', email: 'sales@nestle.sa', phone: '0502223344', balance: 3900 },
    { id: 'c3', company_name: 'أرامكو', type: 'brand', email: 'media@aramco.com', phone: '0503334455', balance: 2100 },
    { id: 'c4', company_name: 'م. الأندلس', type: 'minimarket', email: null, phone: '0501234567', balance: 0 },
    { id: 'c5', company_name: 'م. الريم', type: 'minimarket', email: null, phone: '0509876543', balance: 0 },
  ],
  media: [
    { id: 'm1', file_name: 'pepsi-ramadan-30s.mp4', file_type: 'video', duration_sec: 30, file_size_mb: 45, client: { company_name: 'بيبسي' }, created_at: '2026-03-01' },
    { id: 'm2', file_name: 'nestle-summer-20s.mp4', file_type: 'video', duration_sec: 20, file_size_mb: 28, client: { company_name: 'نستله' }, created_at: '2026-03-10' },
    { id: 'm3', file_name: 'aramco-banner.jpg', file_type: 'image', duration_sec: 15, file_size_mb: 2.1, client: { company_name: 'أرامكو' }, created_at: '2026-04-01' },
    { id: 'm4', file_name: 'kilo-promo-10s.mp4', file_type: 'video', duration_sec: 10, file_size_mb: 18, client: { company_name: 'الكيلو' }, created_at: '2026-03-20' },
    { id: 'm5', file_name: 'almarai-launch.jpg', file_type: 'image', duration_sec: 15, file_size_mb: 1.8, client: { company_name: 'الألبان السعودية' }, created_at: '2026-04-05' },
    { id: 'm6', file_name: 'pepsi-main-25s.mp4', file_type: 'video', duration_sec: 25, file_size_mb: 36, client: { company_name: 'بيبسي' }, created_at: '2026-02-15' },
  ],
}

export async function getClients() {
  if (!supabase) return mockData.clients
  const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  return data || mockData.clients
}

export async function createClient_(client: { company_name: string, type: string, email: string, phone: string }) {
  if (!supabase) return null
  const { data, error } = await supabase.from('clients').insert(client).select().single()
  if (error) console.error(error)
  return data
}

export async function updateClient(id: string, updates: any) {
  if (!supabase) return null
  const { data } = await supabase.from('clients').update(updates).eq('id', id).select().single()
  return data
}

export async function deleteClient(id: string) {
  if (!supabase) return
  await supabase.from('clients').delete().eq('id', id)
}

export async function getCampaigns() {
  if (!supabase) return mockData.campaigns
  const { data } = await supabase.from('campaigns').select('*, client:clients(*)').order('created_at', { ascending: false })
  return data || mockData.campaigns
}

export async function createCampaign(campaign: any) {
  if (!supabase) return null
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single()
  if (error) console.error(error)
  return data
}

export async function updateCampaign(id: string, updates: any) {
  if (!supabase) return null
  const { data } = await supabase.from('campaigns').update(updates).eq('id', id).select().single()
  return data
}

export async function deleteCampaign_(id: string) {
  if (!supabase) return
  await supabase.from('campaigns').delete().eq('id', id)
}

export async function getScreens() {
  if (!supabase) return mockData.screens
  const { data } = await supabase.from('screens').select('*, location:locations(*)').order('created_at', { ascending: false })
  return data || mockData.screens
}

export async function createScreen(screen: any) {
  if (!supabase) return null
  const pairCode = generatePairCode()
  const { data, error } = await supabase.from('screens').insert({ ...screen, pair_code: pairCode }).select().single()
  if (error) console.error(error)
  return data
}

export async function deleteScreen(id: string) {
  if (!supabase) return
  await supabase.from('screens').delete().eq('id', id)
}

export async function getMedia() {
  if (!supabase) return mockData.media
  const { data } = await supabase.from('media').select('*, client:clients(*)').order('created_at', { ascending: false })
  return data || mockData.media
}

export async function uploadMedia(file: File, clientId: string) {
  if (!supabase) return null
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
  if (error) console.error(error)
  return data
}

export async function deleteMedia(id: string, fileUrl: string) {
  if (!supabase) return
  const path = fileUrl.split('/shelfy-media/')[1]
  if (path) await supabase.storage.from('shelfy-media').remove([path])
  await supabase.from('media').delete().eq('id', id)
}

function generatePairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 7; i++) {
    if (i === 3) code += '-'
    else code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
