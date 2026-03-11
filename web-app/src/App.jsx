import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import AlbumGrid from './components/AlbumGrid'
import AlbumDetail from './components/AlbumDetail'

function App() {
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [filters, setFilters] = useState({
    year: '',
    publisher: '',
    genre: '',
    artist: '',
    instrument: '',
    sortBy: 'title'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Load catalog
  useEffect(() => {
    fetch('/data/catalog.json')
      .then(res => res.json())
      .then(data => {
        setCatalog(data.items)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading catalog:', error)
        setLoading(false)
      })
  }, [])

  // Filter and search logic
  const filteredAlbums = useMemo(() => {
    let results = [...catalog]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      results = results.filter(album =>
        album.title.toLowerCase().includes(search) ||
        album.artists.some(artist => artist.toLowerCase().includes(search)) ||
        album.description.toLowerCase().includes(search) ||
        album.publisher.toLowerCase().includes(search)
      )
    }

    // Year filter
    if (filters.year) {
      results = results.filter(album => album.year === filters.year)
    }

    // Publisher filter
    if (filters.publisher) {
      results = results.filter(album => album.publisher === filters.publisher)
    }

    // Genre filter
    if (filters.genre) {
      results = results.filter(album =>
        album.genre.includes(filters.genre)
      )
    }

    // Artist filter
    if (filters.artist) {
      results = results.filter(album =>
        album.artists.some(artist =>
          artist.toLowerCase() === filters.artist.toLowerCase()
        )
      )
    }

    // Instrument filter
    if (filters.instrument) {
      results = results.filter(album =>
        album.instruments.includes(filters.instrument)
      )
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
          return a.artists[0].localeCompare(b.artists[0])
        default:
          return 0
      }
    })

    return results
  }, [catalog, searchTerm, filters])

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const years = [...new Set(catalog.map(a => a.year).filter(Boolean))].sort()
    const publishers = [...new Set(catalog.map(a => a.publisher))].sort()
    const genres = [...new Set(catalog.flatMap(a => a.genre))].filter(Boolean).sort()
    const instruments = [...new Set(catalog.flatMap(a => a.instruments))].filter(Boolean).sort()

    return { years, publishers, genres, instruments }
  }, [catalog])

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
      sortBy: 'title'
    })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || filters.year || filters.publisher ||
    filters.genre || filters.artist || filters.instrument

  return (
    <div className="min-h-screen">
      <Header totalAlbums={catalog.length} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
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
          />
        )}

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
          <span className="font-medium text-slate-900">{filteredAlbums.length}</span> album{filteredAlbums.length !== 1 && 's'} found
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-irish-green"></div>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No albums found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear all filters
            </button>
          </div>
        ) : (
          <AlbumGrid
            albums={filteredAlbums}
            onAlbumClick={setSelectedAlbum}
            onFilterClick={handleFilterClick}
          />
        )}
      </main>

      {selectedAlbum && (
        <AlbumDetail
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          onFilterClick={handleFilterClick}
        />
      )}

      <footer className="bg-slate-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 Drumshanbo Music Library</p>
          <p className="text-sm text-slate-400">
            Irish Traditional Music Collection | {catalog.length} albums
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
