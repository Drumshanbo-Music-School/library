import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import AlbumGrid from './components/AlbumGrid'
import AlbumDetail from './components/AlbumDetail'
import BookDetail from './components/BookDetail'
import CatalogToggle from './components/CatalogToggle'

function App() {
  // Catalog type state
  const [catalogType, setCatalogType] = useState('CD')

  // Catalog data
  const [cdCatalog, setCdCatalog] = useState([])
  const [bookCatalog, setBookCatalog] = useState([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filters - combined for both types
  const [filters, setFilters] = useState({
    year: '',
    publisher: '',
    // CD-specific
    genre: '',
    artist: '',
    instrument: '',
    track: '',
    // Book-specific
    subject: '',
    category: '',
    author: '',
    format: '',
    sortBy: 'title'
  })

  // Load both catalogs
  useEffect(() => {
    Promise.all([
      fetch('/data/catalog.json').then(res => res.json()),
      fetch('/data/catalog-books.json').then(res => res.json())
    ])
      .then(([cdData, bookData]) => {
        setCdCatalog(cdData.items)
        setBookCatalog(bookData.items)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading catalogs:', error)
        setLoading(false)
      })
  }, [])

  // Get active catalog based on type
  const activeCatalog = catalogType === 'CD' ? cdCatalog : bookCatalog

  // Handle catalog type change
  const handleCatalogChange = (newType) => {
    setCatalogType(newType)
    clearFilters()
    setSelectedItem(null)
  }

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let results = [...activeCatalog]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (catalogType === 'CD') {
        results = results.filter(item =>
          item.title.toLowerCase().includes(search) ||
          item.artists.some(artist => artist.toLowerCase().includes(search)) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          (item.publisher && item.publisher.toLowerCase().includes(search)) ||
          (item.trackList && item.trackList.some(track => track && track.toLowerCase().includes(search)))
        )
      } else {
        // Book search
        results = results.filter(item =>
          item.title.toLowerCase().includes(search) ||
          item.authors.some(author => author.toLowerCase().includes(search)) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          (item.publisher && item.publisher.toLowerCase().includes(search)) ||
          (item.subjects && item.subjects.some(s => s && s.toLowerCase().includes(search)))
        )
      }
    }

    // Common filters
    if (filters.year) {
      results = results.filter(item => item.year === filters.year)
    }
    if (filters.publisher) {
      results = results.filter(item => item.publisher === filters.publisher)
    }

    // CD-specific filters
    if (catalogType === 'CD') {
      if (filters.genre) {
        results = results.filter(item => item.genre && item.genre.includes(filters.genre))
      }
      if (filters.artist) {
        results = results.filter(item =>
          item.artists.some(artist => artist.toLowerCase() === filters.artist.toLowerCase())
        )
      }
      if (filters.instrument) {
        results = results.filter(item => item.instruments && item.instruments.includes(filters.instrument))
      }
      if (filters.track) {
        results = results.filter(item => item.trackList && item.trackList.includes(filters.track))
      }
    }

    // Book-specific filters
    if (catalogType === 'Book') {
      if (filters.subject) {
        results = results.filter(item => item.subjects && item.subjects.includes(filters.subject))
      }
      if (filters.category) {
        results = results.filter(item => item.categories && item.categories.includes(filters.category))
      }
      if (filters.author) {
        results = results.filter(item =>
          item.authors && item.authors.some(author => author.toLowerCase() === filters.author.toLowerCase())
        )
      }
      if (filters.format) {
        results = results.filter(item => item.format === filters.format)
      }
    }

    // Sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'year':
          return (a.year || '9999').localeCompare(b.year || '9999')
        case 'year-desc':
          return (b.year || '0').localeCompare(a.year || '0')
        case 'artist':
        case 'author':
          const creatorA = catalogType === 'CD' ? (a.artists?.[0] || '') : (a.authors?.[0] || '')
          const creatorB = catalogType === 'CD' ? (b.artists?.[0] || '') : (b.authors?.[0] || '')
          return creatorA.localeCompare(creatorB)
        case 'pageCount':
          return (b.pageCount || 0) - (a.pageCount || 0)
        default:
          return 0
      }
    })

    return results
  }, [activeCatalog, searchTerm, filters, catalogType])

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const years = [...new Set(activeCatalog.map(a => a.year).filter(Boolean))].sort((a, b) => b.localeCompare(a))
    const publishers = [...new Set(activeCatalog.map(a => a.publisher))].sort()

    if (catalogType === 'CD') {
      const genres = [...new Set(activeCatalog.flatMap(a => a.genre || []))].sort()
      const instruments = [...new Set(activeCatalog.flatMap(a => a.instruments || []))].sort()
      return { years, publishers, genres, instruments }
    } else {
      const subjects = [...new Set(activeCatalog.flatMap(a => a.subjects || []))].sort()
      const categories = [...new Set(activeCatalog.flatMap(a => a.categories || []))].sort()
      const formats = [...new Set(activeCatalog.map(a => a.format).filter(Boolean))].sort()
      return { years, publishers, subjects, categories, formats }
    }
  }, [activeCatalog, catalogType])

  const handleFilterClick = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setShowFilters(true)
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
  }

  const hasActiveFilters = searchTerm || filters.year || filters.publisher ||
    filters.genre || filters.artist || filters.instrument || filters.track ||
    filters.subject || filters.category || filters.author || filters.format

  const itemType = catalogType === 'CD' ? 'album' : 'book'
  const itemTypePlural = catalogType === 'CD' ? 'albums' : 'books'

  return (
    <div className="min-h-screen">
      <Header totalCDs={cdCatalog.length} totalBooks={bookCatalog.length} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Catalog Toggle */}
        <CatalogToggle
          activeCatalog={catalogType}
          onCatalogChange={handleCatalogChange}
          cdCount={cdCatalog.length}
          bookCount={bookCatalog.length}
        />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            filterOptions={filterOptions}
            catalogType={catalogType}
          />
        )}

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">Active filters:</span>
            {searchTerm && (
              <span className="badge bg-irish-green text-white">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-slate-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.artist && (
              <span className="badge bg-blue-100 text-blue-800">
                Artist: {filters.artist}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, artist: '' }))}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.author && (
              <span className="badge bg-blue-100 text-blue-800">
                Author: {filters.author}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, author: '' }))}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.instrument && (
              <span className="badge bg-purple-100 text-purple-800">
                Instrument: {filters.instrument}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, instrument: '' }))}
                  className="ml-2 hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.track && (
              <span className="badge bg-orange-100 text-orange-800">
                Track: {filters.track}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, track: '' }))}
                  className="ml-2 hover:text-orange-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.subject && (
              <span className="badge bg-blue-100 text-blue-800">
                Subject: {filters.subject}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, subject: '' }))}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="badge bg-purple-100 text-purple-800">
                Category: {filters.category}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                  className="ml-2 hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.format && (
              <span className="badge bg-amber-100 text-amber-800">
                Format: {filters.format}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, format: '' }))}
                  className="ml-2 hover:text-amber-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.year && (
              <span className="badge bg-amber-100 text-amber-800">
                Year: {filters.year}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, year: '' }))}
                  className="ml-2 hover:text-amber-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.publisher && (
              <span className="badge bg-slate-100 text-slate-800">
                Publisher: {filters.publisher}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, publisher: '' }))}
                  className="ml-2 hover:text-slate-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.genre && (
              <span className="badge bg-green-100 text-green-800">
                Genre: {filters.genre}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, genre: '' }))}
                  className="ml-2 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-irish-green hover:text-green-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mb-6 text-slate-600">
          <span className="font-medium text-slate-900">{filteredItems.length}</span> {itemType}{filteredItems.length !== 1 && 's'} found
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-irish-green"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No {itemTypePlural} found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear all filters
            </button>
          </div>
        ) : (
          <AlbumGrid
            items={filteredItems}
            onItemClick={setSelectedItem}
            onFilterClick={handleFilterClick}
            catalogType={catalogType}
          />
        )}
      </main>

      {/* Detail modals */}
      {selectedItem && catalogType === 'CD' && (
        <AlbumDetail
          album={selectedItem}
          onClose={() => setSelectedItem(null)}
          onFilterClick={handleFilterClick}
        />
      )}

      {selectedItem && catalogType === 'Book' && (
        <BookDetail
          book={selectedItem}
          onClose={() => setSelectedItem(null)}
          onFilterClick={handleFilterClick}
        />
      )}

      <footer className="bg-slate-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 Drumshanbo Music Library</p>
          <p className="text-sm text-slate-400">
            Irish Traditional Music Collection | {cdCatalog.length} albums • {bookCatalog.length} books
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
