export async function uploadMedia(file: File, clientId: string) {
  if (!supabase) return null
  const fileName = `${Date.now()}_${file.name}`
  const filePath = `media/${clientId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('shelfy-media')
    .upload(filePath, file)

  if (uploadError) {
    console.error(uploadError)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('shelfy-media')
    .getPublicUrl(filePath)

  const fileType = file.type.startsWith('video/') ? 'video' : 'image'

  const { data, error } = await supabase
    .from('media')
    .insert({
      client_id: clientId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: fileType,
      file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
      duration_sec: 15,
    })
    .select()
    .single()

  if (error) console.error(error)
  return data
}

export async function deleteMedia(id: string, fileUrl: string) {
  if (!supabase) return
  const path = fileUrl.split('/shelfy-media/')[1]
  if (path) {
    await supabase.storage.from('shelfy-media').remove([path])
  }
  await supabase.from('media').delete().eq('id', id)
}
