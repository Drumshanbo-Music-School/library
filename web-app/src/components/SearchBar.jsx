export default function SearchBar({ searchTerm, onSearchChange, showFilters, onToggleFilters }) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, artist, description, or publisher..."
            className="w-full px-4 py-3 pl-12 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-irish-green focus:border-transparent shadow-sm"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">
            🔍
          </span>
        </div>
        <button
          onClick={onToggleFilters}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-irish-green text-white hover:bg-green-700' : ''}`}
        >
          <span>Filters</span>
          <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>
    </div>
  )
}
