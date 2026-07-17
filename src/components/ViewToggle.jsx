export default function ViewToggle({ viewMode, onViewModeChange }) {
  return (
    <div
      className="inline-flex rounded-md p-0.5"
      style={{ backgroundColor: 'var(--color-neutral-light)' }}
    >
      <button
        onClick={() => onViewModeChange('grid')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
          viewMode === 'grid' ? 'shadow-sm' : ''
        }`}
        style={
          viewMode === 'grid'
            ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)' }
            : { color: 'var(--color-text-muted)' }
        }
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
          <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
          <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
          <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
        </svg>
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
          viewMode === 'list' ? 'shadow-sm' : ''
        }`}
        style={
          viewMode === 'list'
            ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)' }
            : { color: 'var(--color-text-muted)' }
        }
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <line x1="8" y1="6" x2="21" y2="6" strokeWidth={2} />
          <line x1="8" y1="12" x2="21" y2="12" strokeWidth={2} />
          <line x1="8" y1="18" x2="21" y2="18" strokeWidth={2} />
          <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={2} strokeLinecap="round" />
          <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={2} strokeLinecap="round" />
          <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
