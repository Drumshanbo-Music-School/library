import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

/**
 * Button to export entire catalog as CSV
 */
export default function ExportButton() {
  const [exporting, setExporting] = useState(false)

  /**
   * Escape CSV value to handle quotes and commas
   */
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  /**
   * Format array as semicolon-separated string
   */
  const formatArray = (arr) => {
    if (!arr || !Array.isArray(arr)) return ''
    return arr.join('; ')
  }

  /**
   * Format links object as string
   */
  const formatLinks = (links) => {
    if (!links || typeof links !== 'object') return ''
    const linkStrings = Object.entries(links)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([key, url]) => `${key}: ${url}`)
    return linkStrings.join('; ')
  }

  /**
   * Generate CSV content from catalog items
   */
  const generateCSV = (items) => {
    // CSV Headers
    const headers = [
      'ID',
      'Type',
      'Title',
      'Artists/Authors',
      'Year',
      'Publisher',
      'Description',
      'Tracks',
      'Runtime',
      'Genre/Subjects',
      'Instruments',
      'Links',
      'Image'
    ]

    // CSV Rows
    const rows = items.map(item => {
      const creators = item.type === 'CD'
        ? formatArray(item.artists)
        : formatArray(item.authors)

      const genreOrSubjects = item.type === 'CD'
        ? formatArray(item.genre)
        : formatArray(item.subjects)

      return [
        escapeCSV(item.id),
        escapeCSV(item.type),
        escapeCSV(item.title),
        escapeCSV(creators),
        escapeCSV(item.year),
        escapeCSV(item.publisher),
        escapeCSV(item.description),
        escapeCSV(item.tracks || ''),
        escapeCSV(item.runtime || ''),
        escapeCSV(genreOrSubjects),
        escapeCSV(formatArray(item.instruments)),
        escapeCSV(formatLinks(item.links)),
        escapeCSV(item.image)
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return csvContent
  }

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    setExporting(true)

    try {
      // Fetch all items from both tables
      const [cdResult, bookResult] = await Promise.all([
        supabase.from('cd_items').select('*'),
        supabase.from('book_items').select('*')
      ])

      if (cdResult.error) throw cdResult.error
      if (bookResult.error) throw bookResult.error

      // Combine and add type field
      const allItems = [
        ...(cdResult.data || []).map(item => ({ ...item, type: 'CD' })),
        ...(bookResult.data || []).map(item => ({ ...item, type: 'Book' }))
      ]

      // Sort by ID
      allItems.sort((a, b) => a.id.localeCompare(b.id))

      // Generate CSV
      const csvContent = generateCSV(allItems)

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Filename with current date
      const date = new Date().toISOString().split('T')[0]
      link.download = `drumshanbo-catalog-${date}.csv`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${allItems.length} items successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export catalog')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
        color: 'var(--color-text-secondary)'
      }}
      onMouseEnter={(e) => {
        if (!exporting) {
          e.currentTarget.style.borderColor = 'var(--color-border-hover)'
          e.currentTarget.style.color = 'var(--color-text)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.color = 'var(--color-text-secondary)'
      }}
    >
      {exporting ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Export</span>
        </>
      )}
    </button>
  )
}
