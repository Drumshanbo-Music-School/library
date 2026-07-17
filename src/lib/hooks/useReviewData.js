import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { calculateIssueCounts, getDetectorForIssue } from '../issueDetectors'
import { getImageUrl } from '../storage'

/**
 * Transform DB format (snake_case) to UI format (camelCase)
 * Copied from useAdmin.js for independence
 */
function transformFromDbFormat(item, type) {
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

/**
 * Validate if an image can be loaded
 * Returns a promise that resolves to true if image loads, false otherwise
 */
function validateImage(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(false)
      return
    }

    const img = new Image()

    // Set a timeout to avoid hanging
    const timeout = setTimeout(() => {
      resolve(false)
    }, 5000)

    img.onload = () => {
      clearTimeout(timeout)
      // Check if image has valid dimensions (not a 0-byte placeholder)
      if (img.width > 0 && img.height > 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }

    img.src = imageUrl
  })
}

/**
 * Validate images for all items
 * Adds hasValidImage flag to each item
 */
async function validateAllImages(items) {
  const validationPromises = items.map(async (item) => {
    if (!item.image || item.image.trim() === '') {
      return { ...item, hasValidImage: false }
    }

    const imageUrl = getImageUrl(item.image)
    const isValid = await validateImage(imageUrl)
    return { ...item, hasValidImage: isValid }
  })

  return Promise.all(validationPromises)
}

/**
 * Hook for fetching catalog data and calculating data quality issues
 * Fetches all items once and provides client-side filtering
 */
export function useReviewData() {
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [issueCounts, setIssueCounts] = useState({})

  /**
   * Fetch all catalog items from both tables
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch from both tables in parallel
      const [cdResult, bookResult] = await Promise.all([
        supabase.from('cd_items').select('*'),
        supabase.from('book_items').select('*')
      ])

      if (cdResult.error) throw cdResult.error
      if (bookResult.error) throw bookResult.error

      // Transform all items to UI format
      const cdItems = (cdResult.data || []).map(item => transformFromDbFormat(item, 'CD'))
      const bookItems = (bookResult.data || []).map(item => transformFromDbFormat(item, 'Book'))

      const allCatalogItems = [...cdItems, ...bookItems]

      // Validate images for all items
      const itemsWithValidation = await validateAllImages(allCatalogItems)

      // Calculate issue counts
      const counts = calculateIssueCounts(itemsWithValidation)

      setAllItems(itemsWithValidation)
      setIssueCounts(counts)
    } catch (err) {
      console.error('Error fetching review data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch data on mount
   */
  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * Filter items by catalog type and/or issue type
   */
  const filterItems = useCallback((catalogType = 'all', issueType = null) => {
    let filtered = allItems

    // Filter by catalog type
    if (catalogType !== 'all') {
      filtered = filtered.filter(item => item.type === catalogType)
    }

    // Filter by issue type
    if (issueType) {
      const detector = getDetectorForIssue(issueType)
      filtered = filtered.filter(detector)
    }

    return filtered
  }, [allItems])

  /**
   * Get issue counts for a specific tab
   */
  const getCountsForTab = useCallback((catalogType = 'all') => {
    if (catalogType === 'all') {
      return Object.entries(issueCounts).reduce((acc, [key, counts]) => {
        acc[key] = counts.total
        return acc
      }, {})
    }

    const typeKey = catalogType === 'CD' ? 'cd' : 'book'
    return Object.entries(issueCounts).reduce((acc, [key, counts]) => {
      acc[key] = counts[typeKey] || 0
      return acc
    }, {})
  }, [issueCounts])

  /**
   * Get total item count with issues for a tab
   */
  const getTotalIssueCount = useCallback((catalogType = 'all') => {
    const items = catalogType === 'all'
      ? allItems
      : allItems.filter(item => item.type === catalogType)

    // Count unique items that have at least one issue
    const itemsWithIssues = new Set()

    Object.keys(issueCounts).forEach(issueKey => {
      const detector = getDetectorForIssue(issueKey)
      items.filter(detector).forEach(item => itemsWithIssues.add(item.id))
    })

    return itemsWithIssues.size
  }, [allItems, issueCounts])

  return {
    allItems,
    loading,
    error,
    issueCounts,
    filterItems,
    getCountsForTab,
    getTotalIssueCount,
    refresh: fetchData
  }
}
