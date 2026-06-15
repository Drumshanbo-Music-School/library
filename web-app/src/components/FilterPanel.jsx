export default function FilterPanel({ filters, onFilterChange, filterOptions, catalogType = 'CD' }) {
  const handleChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }))
  }

  const isCatalog = (type) => catalogType === type

  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-irish-green"
          >
            <option value="title">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="year">Year (Oldest)</option>
            <option value="year-desc">Year (Newest)</option>
            <option value={isCatalog('CD') ? 'artist' : 'author'}>
              {isCatalog('CD') ? 'Artist' : 'Author'} (A-Z)
            </option>
            {isCatalog('Book') && (
              <option value="pageCount">Page Count (High to Low)</option>
            )}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-irish-green"
          >
            <option value="">All Years</option>
            {filterOptions.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Publisher */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Publisher
          </label>
          <select
            value={filters.publisher}
            onChange={(e) => handleChange('publisher', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-irish-green"
          >
            <option value="">All Publishers</option>
            {filterOptions.publishers.map(pub => (
              <option key={pub} value={pub}>{pub}</option>
            ))}
          </select>
        </div>

        {/* Type-specific filter */}
        {isCatalog('CD') ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-irish-green"
            >
              <option value="">All Genres</option>
              {filterOptions.genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-irish-green"
            >
              <option value="">All Subjects</option>
              {filterOptions.subjects && filterOptions.subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
