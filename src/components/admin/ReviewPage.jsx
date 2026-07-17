import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/hooks/useAuth'
import { useReviewData } from '../../lib/hooks/useReviewData'
import { ISSUE_TYPES } from '../../lib/issueDetectors'
import Header from '../Header'
import QuickFilterCard from './QuickFilterCard'
import ReviewTabs from './ReviewTabs'
import IssueList from './IssueList'
import ExportButton from './ExportButton'
import EditForm from './EditForm'

/**
 * Admin review dashboard for identifying and fixing incomplete catalog entries
 */
export default function ReviewPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()

  // Review data
  const {
    allItems,
    loading: dataLoading,
    error,
    filterItems,
    getCountsForTab,
    getTotalIssueCount,
    refresh
  } = useReviewData()

  // Calculate total counts for header
  const totalCDs = useMemo(() => allItems.filter(item => item.type === 'CD').length, [allItems])
  const totalBooks = useMemo(() => allItems.filter(item => item.type === 'Book').length, [allItems])

  // Filter state
  const [activeTab, setActiveTab] = useState('all')
  const [activeIssue, setActiveIssue] = useState(null)

  // Edit modal state
  const [editingItem, setEditingItem] = useState(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  // Get filtered items
  const filteredItems = useMemo(() => {
    return filterItems(activeTab, activeIssue)
  }, [filterItems, activeTab, activeIssue])

  // Get issue counts for current tab
  const tabIssueCounts = useMemo(() => {
    return getCountsForTab(activeTab)
  }, [getCountsForTab, activeTab])

  // Get tab counts (items with at least one issue)
  const tabCounts = useMemo(() => {
    return {
      all: getTotalIssueCount('all'),
      cd: getTotalIssueCount('CD'),
      book: getTotalIssueCount('Book')
    }
  }, [getTotalIssueCount])

  // Handle quick filter click
  const handleQuickFilterClick = (issueType) => {
    if (activeIssue === issueType) {
      // Clicking active filter clears it
      setActiveIssue(null)
    } else {
      setActiveIssue(issueType)
    }
  }

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item)
  }

  // Handle save/delete - refresh data and close modal
  const handleSaveOrDelete = () => {
    refresh()
    setEditingItem(null)
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div
            className="animate-spin h-12 w-12 rounded-full border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--color-secondary)' }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header totalCDs={totalCDs} totalBooks={totalBooks} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="rounded-lg p-6 text-center border"
            style={{
              backgroundColor: 'var(--color-highlight-pale)',
              borderColor: 'var(--color-highlight)'
            }}
          >
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--color-highlight)' }}
            >
              Error loading catalog data
            </h3>
            <p className="mb-4" style={{ color: 'var(--color-highlight)' }}>{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 rounded-md text-white"
              style={{ backgroundColor: 'var(--color-highlight)' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <Header totalCDs={totalCDs} totalBooks={totalBooks} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar with Export button */}
        <div className="mb-5">
          <ExportButton />
        </div>

        {/* Quick Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {Object.keys(ISSUE_TYPES).map(issueKey => (
            <QuickFilterCard
              key={issueKey}
              issueType={issueKey}
              count={tabIssueCounts[issueKey] || 0}
              active={activeIssue === issueKey}
              onClick={() => handleQuickFilterClick(issueKey)}
            />
          ))}
        </div>

        {/* Review Tabs */}
        <ReviewTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {/* Issue List */}
        <IssueList
          items={filteredItems}
          onEdit={handleEdit}
          loading={dataLoading}
        />
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditForm
          item={editingItem}
          type={editingItem.type}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveOrDelete}
          onDelete={handleSaveOrDelete}
        />
      )}
    </div>
  )
}
