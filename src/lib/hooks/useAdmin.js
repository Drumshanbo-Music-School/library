import { supabase } from '../supabase'

/**
 * Hook for admin CRUD operations on catalog items
 */
export function useAdmin() {
  /**
   * Create a new catalog item
   * @param {Object} item - The item data
   * @param {string} type - 'CD' or 'Book'
   * @returns {Promise<Object>} The created item
   */
  const createItem = async (item, type = 'CD') => {
    const tableName = type === 'CD' ? 'cd_items' : 'book_items'

    // Transform camelCase to snake_case for DB
    const dbItem = transformToDbFormat(item)

    const { data, error } = await supabase
      .from(tableName)
      .insert(dbItem)
      .select()
      .single()

    if (error) throw error
    return transformFromDbFormat(data, type)
  }

  /**
   * Update an existing catalog item
   * @param {string} id - The item ID
   * @param {Object} updates - The fields to update
   * @param {string} type - 'CD' or 'Book'
   * @returns {Promise<Object>} The updated item
   */
  const updateItem = async (id, updates, type = 'CD') => {
    const tableName = type === 'CD' ? 'cd_items' : 'book_items'

    // Transform camelCase to snake_case for DB
    const dbUpdates = transformToDbFormat(updates)

    const { data, error } = await supabase
      .from(tableName)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformFromDbFormat(data, type)
  }

  /**
   * Delete a catalog item
   * @param {string} id - The item ID
   * @param {string} type - 'CD' or 'Book'
   */
  const deleteItem = async (id, type = 'CD') => {
    const tableName = type === 'CD' ? 'cd_items' : 'book_items'

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Upload an image to storage
   * @param {File} file - The image file
   * @param {string} filename - Target filename (e.g., 'cd-415.jpg')
   * @returns {Promise<string>} The public URL
   */
  const uploadImage = async (file, filename) => {
    const { error } = await supabase.storage
      .from('album-covers')
      .upload(filename, file, {
        upsert: true,
        contentType: file.type
      })

    if (error) throw error

    const { data } = supabase.storage
      .from('album-covers')
      .getPublicUrl(filename)

    return data.publicUrl
  }

  /**
   * Get the next available ID for a catalog type
   * @param {string} type - 'CD' or 'Book'
   * @returns {Promise<string>} The next ID (e.g., 'cd-415')
   */
  const getNextId = async (type = 'CD') => {
    const tableName = type === 'CD' ? 'cd_items' : 'book_items'
    const prefix = type === 'CD' ? 'cd' : 'book'

    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    if (error) throw error

    if (!data || data.length === 0) {
      return `${prefix}-001`
    }

    // Extract number from last ID and increment
    const lastId = data[0].id
    const match = lastId.match(/(\d+)$/)
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1
      return `${prefix}-${nextNum.toString().padStart(3, '0')}`
    }

    return `${prefix}-001`
  }

  return {
    createItem,
    updateItem,
    deleteItem,
    uploadImage,
    getNextId
  }
}

/**
 * Transform UI format (camelCase) to DB format (snake_case)
 */
function transformToDbFormat(item) {
  const transformed = { ...item }

  // Map camelCase to snake_case
  if ('catalogNumber' in item) {
    transformed.catalog_number = item.catalogNumber
    delete transformed.catalogNumber
  }
  if ('trackList' in item) {
    transformed.track_list = item.trackList
    delete transformed.trackList
  }
  if ('pageCount' in item) {
    transformed.page_count = item.pageCount
    delete transformed.pageCount
  }
  if ('tuneCount' in item) {
    transformed.tune_count = item.tuneCount
    delete transformed.tuneCount
  }
  if ('contentType' in item) {
    transformed.content_type = item.contentType
    delete transformed.contentType
  }

  // Remove UI-only fields
  delete transformed.type

  return transformed
}

/**
 * Transform DB format (snake_case) to UI format (camelCase)
 */
function transformFromDbFormat(item, type) {
  // Destructure to extract snake_case fields and separate them from rest
  const {
    catalog_number,
    track_list,
    page_count,
    tune_count,
    content_type,
    ...rest
  } = item

  return {
    ...rest,
    catalogNumber: catalog_number,
    trackList: track_list,
    pageCount: page_count,
    tuneCount: tune_count,
    contentType: content_type,
    type: type
  }
}
