import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

const PAGE_SIZE = 24

/**
 * Hook for fetching catalog items with pagination and filtering
 * @param {Object} options
 * @param {string} options.type - 'CD' or 'Book'
 * @param {Object} options.filters - Filter values
 * @param {string} options.searchTerm - Search query
 */
export function useCatalog({ type = 'CD', filters = {}, searchTerm = '' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const pageRef = useRef(0)

  const tableName = type === 'CD' ? 'cd_items' : 'book_items'

  const buildQuery = useCallback((countOnly = false) => {
    let query = supabase
      .from(tableName)
      .select(countOnly ? '*' : '*', { count: 'exact', head: countOnly })

    // Search filter - use the generated search_text column for CDs,
    // which includes title, artists, track_list, description, and instruments
    if (searchTerm) {
      const search = `%${searchTerm}%`
      if (type === 'CD') {
        query = query.ilike('search_text', search)
      } else {
        // Books don't have search_text column yet, use basic fields
        query = query.or(`title.ilike.${search},description.ilike.${search},publisher.ilike.${search}`)
      }
    }

    // Common filters
    if (filters.year) {
      query = query.eq('year', filters.year)
    }
    if (filters.publisher) {
      query = query.eq('publisher', filters.publisher)
    }

    // CD-specific filters
    if (type === 'CD') {
      if (filters.genre) {
        query = query.contains('genre', [filters.genre])
      }
      if (filters.artist) {
        query = query.contains('artists', [filters.artist])
      }
      if (filters.instrument) {
        query = query.contains('instruments', [filters.instrument])
      }
      if (filters.track) {
        query = query.contains('track_list', [filters.track])
      }
    }

    // Book-specific filters
    if (type === 'Book') {
      if (filters.subject) {
        query = query.contains('subjects', [filters.subject])
      }
      if (filters.category) {
        query = query.contains('categories', [filters.category])
      }
      if (filters.author) {
        query = query.contains('authors', [filters.author])
      }
      if (filters.format) {
        query = query.eq('format', filters.format)
      }
    }

    return query
  }, [tableName, type, searchTerm, filters])

  const fetchItems = useCallback(async (pageNumber = 0, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      let query = buildQuery()

      // Sorting
      const sortBy = filters.sortBy || 'title'
      const isArtistSort = sortBy === 'artist' || sortBy === 'author'

      switch (sortBy) {
        case 'title':
          query = query.order('title', { ascending: true })
          break
        case 'title-desc':
          query = query.order('title', { ascending: false })
          break
        case 'year':
          query = query.order('year', { ascending: true, nullsFirst: false })
          break
        case 'year-desc':
          query = query.order('year', { ascending: false, nullsFirst: false })
          break
        case 'artist':
        case 'author':
          // No server-side ordering - we'll fetch all and sort client-side
          break
        default:
          query = query.order('title', { ascending: true })
      }

      // Pagination - skip for artist/author sort (need all items for proper sorting)
      if (!isArtistSort) {
        const from = pageNumber * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        query = query.range(from, to)
      }

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      // Transform data to match expected format
      let transformed = data.map(item => {
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
          // Map snake_case DB columns to camelCase used in UI
          catalogNumber: catalog_number,
          trackList: track_list,
          pageCount: page_count,
          tuneCount: tune_count,
          contentType: content_type,
          // Keep the type field for compatibility
          type: type
        }
      })

      // Client-side sorting for artist/author (arrays can't be sorted by DB)
      if (isArtistSort) {
        const field = sortBy === 'artist' ? 'artists' : 'authors'
        transformed = transformed.sort((a, b) => {
          const aVal = (a[field] && a[field][0]) || ''
          const bVal = (b[field] && b[field][0]) || ''
          return aVal.localeCompare(bVal)
        })
      }

      setTotalCount(count || 0)
      setItems(prev => append ? [...prev, ...transformed] : transformed)
      // No more items to load if we fetched all for artist/author sort
      setHasMore(isArtistSort ? false : (pageNumber + 1) * PAGE_SIZE < (count || 0))
      pageRef.current = pageNumber
    } catch (err) {
      console.error('Error fetching catalog:', err)
      setError(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [buildQuery, filters.sortBy, type])

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    pageRef.current = 0
    fetchItems(0, false)
  }, [type, filters, searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchItems(pageRef.current + 1, true)
    }
  }, [loading, loadingMore, hasMore, fetchItems])

  const refresh = useCallback(() => {
    pageRef.current = 0
    setItems([])
    fetchItems(0, false)
  }, [fetchItems])

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount
  }
}

/**
 * Hook for fetching a single catalog item by ID
 * @param {string} id - The item ID (e.g., 'cd-001')
 * @param {string} type - 'CD' or 'Book'
 */
export function useCatalogItem(id, type = 'CD') {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tableName = type === 'CD' ? 'cd_items' : 'book_items'

  useEffect(() => {
    async function fetchItem() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        // Transform to match expected format
        const {
          catalog_number,
          track_list,
          page_count,
          tune_count,
          content_type,
          ...rest
        } = data

        setItem({
          ...rest,
          catalogNumber: catalog_number,
          trackList: track_list,
          pageCount: page_count,
          tuneCount: tune_count,
          contentType: content_type,
          type: type
        })
      } catch (err) {
        console.error('Error fetching item:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, tableName, type])

  return { item, loading, error }
}

/**
 * Hook for fetching unique filter option values
 * @param {string} type - 'CD' or 'Book'
 */
export function useFilterOptions(type = 'CD') {
  const [options, setOptions] = useState({
    years: [],
    publishers: [],
    genres: [],
    instruments: [],
    artists: [],
    subjects: [],
    categories: [],
    formats: []
  })
  const [loading, setLoading] = useState(true)

  const tableName = type === 'CD' ? 'cd_items' : 'book_items'

  useEffect(() => {
    async function fetchOptions() {
      try {
        // Select only columns that exist for each table type
        const selectColumns = type === 'CD'
          ? 'year, publisher, genre, instruments, artists'
          : 'year, publisher, subjects, categories, format'

        const { data, error } = await supabase
          .from(tableName)
          .select(selectColumns)

        if (error) throw error

        if (data) {
          // Handle year as string or number, sort newest first
          const years = [...new Set(data.map(d => d.year).filter(Boolean))]
            .map(y => String(y))
            .sort((a, b) => Number(b) - Number(a))
          const publishers = [...new Set(data.map(d => d.publisher).filter(Boolean))].sort()

          if (type === 'CD') {
            const genres = [...new Set(data.flatMap(d => d.genre || []))].sort()
            const instruments = [...new Set(data.flatMap(d => d.instruments || []))].sort()
            const artists = [...new Set(data.flatMap(d => d.artists || []))].sort()
            setOptions({ years, publishers, genres, instruments, artists, subjects: [], categories: [], formats: [] })
          } else {
            const subjects = [...new Set(data.flatMap(d => d.subjects || []))].sort()
            const categories = [...new Set(data.flatMap(d => d.categories || []))].sort()
            const formats = [...new Set(data.map(d => d.format).filter(Boolean))].sort()
            setOptions({ years, publishers, genres: [], instruments: [], artists: [], subjects, categories, formats })
          }
        }
      } catch (err) {
        console.error('Error fetching filter options:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [tableName, type])

  return { options, loading }
}
