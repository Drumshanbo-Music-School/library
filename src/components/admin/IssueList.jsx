import { useState, useEffect } from 'react'
import IssueCard from './IssueCard'
import Pagination from '../Pagination'

const ITEMS_PER_PAGE = 24

/**
 * List of catalog items with data quality issues
 * @param {Object} props
 * @param {Array} props.items - Filtered items to display
 * @param {Function} props.onEdit - Edit button handler
 * @param {boolean} props.loading - Loading state
 */
export default function IssueList({ items, onEdit, loading }) {
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items])

  // Calculate pagination
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = items.slice(startIndex, endIndex)

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-irish-green mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-600">Loading catalog data...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-medium text-slate-900 mb-2">
          No issues found
        </h3>
        <p className="text-slate-600">
          All catalog items are complete and up to standard.
        </p>
      </div>
    )
  }

  // Items list
  return (
    <div>
      {/* Item count */}
      <div className="mb-4 text-sm text-slate-600">
        Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} items
      </div>

      {/* Issue cards */}
      <div className="space-y-4 mb-8">
        {currentItems.map(item => (
          <IssueCard
            key={item.id}
            item={item}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
