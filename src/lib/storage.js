import { supabase } from './supabase'

/**
 * Get the public URL for an image in the album-covers bucket
 * @param {string} filename - The image filename (e.g., 'cd-001.jpg')
 * @param {number|string} [cacheKey] - Optional cache-busting key (e.g., imageUpdatedAt timestamp)
 * @returns {string|null} The public URL or null if no filename provided
 */
export function getImageUrl(filename, cacheKey) {
  if (!filename) return null

  const { data } = supabase.storage
    .from('album-covers')
    .getPublicUrl(filename)

  if (cacheKey) {
    return `${data.publicUrl}?v=${cacheKey}`
  }

  return data.publicUrl
}

/**
 * Upload an image to the album-covers bucket
 * @param {File} file - The image file to upload
 * @param {string} filename - The target filename (e.g., 'cd-415.jpg')
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImage(file, filename) {
  const { error } = await supabase.storage
    .from('album-covers')
    .upload(filename, file, {
      upsert: true,
      contentType: file.type
    })

  if (error) throw error

  return getImageUrl(filename)
}
