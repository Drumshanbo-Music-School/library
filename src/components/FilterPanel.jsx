import { useState, useRef, useEffect } from 'react'

function FilterDropdown({ label, value, options, onChange, placeholder = 'All' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = value || placeholder

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors ${
          value
            ? 'border-secondary bg-secondary-light text-secondary'
            : 'border-neutral bg-white text-accent hover:border-accent hover:text-secondary'
        }`}
      >
        <span>{label}</span>
        {value && <span className="font-medium">: {value}</span>}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-neutral rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-light transition-colors ${
              !value ? 'text-secondary font-medium' : 'text-accent'
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-light transition-colors ${
                value === option ? 'text-secondary font-medium bg-secondary-light' : 'text-primary'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterPanel({ filters, onFilterChange, filterOptions, catalogType = 'CD' }) {
  const handleChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }))
  }

  const isCatalog = (type) => catalogType === type

  const sortOptions = isCatalog('CD')
    ? [
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'year', label: 'Year (Oldest)' },
        { value: 'year-desc', label: 'Year (Newest)' },
        { value: 'artist', label: 'Artist (A-Z)' },
      ]
    : [
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'year', label: 'Year (Oldest)' },
        { value: 'year-desc', label: 'Year (Newest)' },
        { value: 'author', label: 'Author (A-Z)' },
        { value: 'pageCount', label: 'Page Count' },
      ]

  const currentSortLabel = sortOptions.find(o => o.value === filters.sortBy)?.label || 'Title (A-Z)'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Sort dropdown */}
      <div className="relative">
        <FilterDropdown
          label="Sort"
          value={currentSortLabel !== 'Title (A-Z)' ? currentSortLabel : ''}
          options={sortOptions.map(o => o.label)}
          onChange={(label) => {
            const option = sortOptions.find(o => o.label === label)
            handleChange('sortBy', option?.value || 'title')
          }}
          placeholder="Title (A-Z)"
        />
      </div>

      {/* Year filter */}
      <FilterDropdown
        label="Year"
        value={filters.year}
        options={filterOptions.years || []}
        onChange={(value) => handleChange('year', value)}
        placeholder="All Years"
      />

      {/* Type-specific filters */}
      {isCatalog('CD') ? (
        <>
          <FilterDropdown
            label="Artist"
            value={filters.artist}
            options={filterOptions.artists || []}
            onChange={(value) => handleChange('artist', value)}
            placeholder="All Artists"
          />

          <FilterDropdown
            label="Instrument"
            value={filters.instrument}
            options={filterOptions.instruments || []}
            onChange={(value) => handleChange('instrument', value)}
            placeholder="All Instruments"
          />

          <FilterDropdown
            label="Genre"
            value={filters.genre}
            options={filterOptions.genres || []}
            onChange={(value) => handleChange('genre', value)}
            placeholder="All Genres"
          />
        </>
      ) : (
        <>
          <FilterDropdown
            label="Subject"
            value={filters.subject}
            options={filterOptions.subjects || []}
            onChange={(value) => handleChange('subject', value)}
            placeholder="All Subjects"
          />

          <FilterDropdown
            label="Author"
            value={filters.author}
            options={filterOptions.authors || []}
            onChange={(value) => handleChange('author', value)}
            placeholder="All Authors"
          />
        </>
      )}
    </div>
  )
}
