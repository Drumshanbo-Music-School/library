import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { calculateIssueCounts, getDetectorForIssue } from '../issueDetectors'

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

      // Calculate issue counts
      const counts = calculateIssueCounts(allCatalogItems)

      setAllItems(allCatalogItems)
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
