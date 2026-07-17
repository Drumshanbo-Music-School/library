import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import AlbumGrid from './components/AlbumGrid'
import AlbumList from './components/AlbumList'
import AlbumDetail from './components/AlbumDetail'
import BookDetail from './components/BookDetail'
import ViewToggle from './components/ViewToggle'
import ScrollModeToggle from './components/ScrollModeToggle'
import LoginPage from './components/admin/LoginPage'
import ReviewPage from './components/admin/ReviewPage'
import EditForm from './components/admin/EditForm'
import { useCatalog, useFilterOptions } from './lib/hooks/useCatalog'
import { useAuth } from './lib/hooks/useAuth'

function CatalogPage() {
  const location = useLocation()

  // Catalog type state - initialized from location state if navigating from Review page
  const [catalogType, setCatalogType] = useState(() => {
    return location.state?.catalogType || 'CD'
  })

  // Update catalog type if navigating with state
  useEffect(() => {
    if (location.state?.catalogType) {
      setCatalogType(location.state.catalogType)
    }
  }, [location.state])

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('library-view-mode') || 'grid'
  })

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode)
    localStorage.setItem('library-view-mode', newMode)
  }

  // Scroll mode state with localStorage persistence
  const [scrollMode, setScrollMode] = useState(() => {
    return localStorage.getItem('library-scroll-mode') || 'continuous'
  })

  const handleScrollModeChange = (newMode) => {
    setScrollMode(newMode)
    localStorage.setItem('library-scroll-mode', newMode)
    // Reset to page 1 when switching modes
    setCurrentPage(1)
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 24 // Match the useCatalog hook's page size

  // Auth
  const { isAuthenticated } = useAuth()

  // Filters
  const [filters, setFilters] = useState({
    year: '',
    publisher: '',
    genre: '',
    artist: '',
    instrument: '',
    track: '',
    subject: '',
    category: '',
    author: '',
    format: '',
    sortBy: 'title'
  })

  // Fetch data from Supabase with pagination
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    totalCount,
    refresh
  } = useCatalog({
    type: catalogType,
    filters,
    searchTerm
  })

  // Fetch filter options
  const { options: filterOptions } = useFilterOptions(catalogType)

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // In pagination mode, slice items to show only current page
  const displayItems = useMemo(() => {
    if (scrollMode === 'continuous') {
      return items // Show all loaded items for infinite scroll
    } else {
      // In paginated mode, show only current page
      const startIndex = (currentPage - 1) * PAGE_SIZE
      const endIndex = startIndex + PAGE_SIZE
      return items.slice(startIndex, endIndex)
    }
  }, [scrollMode, items, currentPage, PAGE_SIZE])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)

    // If we don't have enough items loaded for the requested page, load more
    const requiredItems = newPage * PAGE_SIZE
    if (items.length < requiredItems && hasMore) {
      loadMore()
    }
  }

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Handle catalog type change
  const handleCatalogChange = (newType) => {
    setCatalogType(newType)
    clearFilters()
    setSelectedItem(null)
    setCurrentPage(1)
  }

  const handleFilterClick = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setCurrentPage(1) // Reset to page 1 when filtering
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({
      year: '',
      publisher: '',
      genre: '',
      artist: '',
      instrument: '',
      track: '',
      subject: '',
      category: '',
      author: '',
      format: '',
      sortBy: 'title'
    })
    setSearchTerm('')
    setCurrentPage(1) // Reset to page 1 when clearing filters
  }

  const hasActiveFilters = searchTerm || filters.year || filters.publisher ||
    filters.genre || filters.artist || filters.instrument || filters.track ||
    filters.subject || filters.category || filters.author || filters.format

  const itemType = catalogType === 'CD' ? 'album' : 'book'

  // Count for header (use totalCount from current query)
  const cdCount = catalogType === 'CD' ? totalCount : 0
  const bookCount = catalogType === 'Book' ? totalCount : 0

  const handleEdit = (item) => {
    setSelectedItem(null)
    setEditingItem(item)
  }

  const handleCreate = () => {
    setIsCreating(true)
  }

  const handleSaveEdit = () => {
    refresh()
  }

  const handleDelete = () => {
    refresh()
  }

  const handleCloseEditForm = () => {
    setEditingItem(null)
    setIsCreating(false)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header
        totalCDs={cdCount}
        totalBooks={bookCount}
        activeCatalog={catalogType}
        onCatalogChange={handleCatalogChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side - Filters */}
          <div className="pb-2 md:pb-0">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              filterOptions={filterOptions}
              catalogType={catalogType}
            />
          </div>

          {/* Right side - Toggles and Add button */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
            <ScrollModeToggle scrollMode={scrollMode} onScrollModeChange={handleScrollModeChange} />
            <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            {isAuthenticated && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--color-highlight)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-highlight-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-highlight)'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add {catalogType === 'CD' ? 'Album' : 'Book'}</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {searchTerm && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.artist && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                Artist: {filters.artist}
                <button onClick={() => setFilters(prev => ({ ...prev, artist: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.author && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                Author: {filters.author}
                <button onClick={() => setFilters(prev => ({ ...prev, author: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.instrument && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
              >
                Instrument: {filters.instrument}
                <button onClick={() => setFilters(prev => ({ ...prev, instrument: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.track && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-highlight-light)', color: 'var(--color-highlight)' }}
              >
                Track: {filters.track}
                <button onClick={() => setFilters(prev => ({ ...prev, track: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.subject && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                Subject: {filters.subject}
                <button onClick={() => setFilters(prev => ({ ...prev, subject: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.category && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
              >
                Category: {filters.category}
                <button onClick={() => setFilters(prev => ({ ...prev, category: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.format && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-highlight-light)', color: 'var(--color-highlight)' }}
              >
                Format: {filters.format}
                <button onClick={() => setFilters(prev => ({ ...prev, format: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.year && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-text-secondary)' }}
              >
                Year: {filters.year}
                <button onClick={() => setFilters(prev => ({ ...prev, year: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.publisher && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-text-secondary)' }}
              >
                Publisher: {filters.publisher}
                <button onClick={() => setFilters(prev => ({ ...prev, publisher: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.genre && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                Genre: {filters.genre}
                <button onClick={() => setFilters(prev => ({ ...prev, genre: '' }))} className="ml-1 opacity-60 hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm font-medium underline underline-offset-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>{totalCount}</span> {itemType}{totalCount !== 1 && 's'} found
        </div>

        {loading && items.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-irish-green"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-2">No {itemType}s found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <AlbumGrid
            items={displayItems}
            onItemClick={setSelectedItem}
            onFilterClick={handleFilterClick}
            catalogType={catalogType}
            hasMore={hasMore}
            loadMore={loadMore}
            loadingMore={loadingMore}
            scrollMode={scrollMode}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        ) : (
          <AlbumList
            items={displayItems}
            onItemClick={setSelectedItem}
            onFilterClick={handleFilterClick}
            catalogType={catalogType}
            hasMore={hasMore}
            loadMore={loadMore}
            loadingMore={loadingMore}
            scrollMode={scrollMode}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Detail modals */}
      {selectedItem && catalogType === 'CD' && (
        <AlbumDetail
          album={selectedItem}
          onClose={() => setSelectedItem(null)}
          onFilterClick={handleFilterClick}
          onEdit={isAuthenticated ? () => handleEdit(selectedItem) : null}
        />
      )}

      {selectedItem && catalogType === 'Book' && (
        <BookDetail
          book={selectedItem}
          onClose={() => setSelectedItem(null)}
          onFilterClick={handleFilterClick}
          onEdit={isAuthenticated ? () => handleEdit(selectedItem) : null}
        />
      )}

      {/* Edit/Create modal */}
      {(editingItem || isCreating) && (
        <EditForm
          item={editingItem}
          type={catalogType}
          onClose={handleCloseEditForm}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}

      <footer className="py-8 mt-20" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container mx-auto px-4 text-center text-white">
          <p className="mb-2">&copy; 2025 Drumshanbo Music Library</p>
          <p className="text-sm opacity-70">
            Irish Traditional Music Collection
          </p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  )
}

export default App
