export default function ScrollModeToggle({ scrollMode, onScrollModeChange }) {
  return (
    <div
      className="inline-flex rounded-md p-0.5"
      style={{ backgroundColor: 'var(--color-neutral-light)' }}
    >
      <button
        onClick={() => onScrollModeChange('continuous')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
          scrollMode === 'continuous' ? 'shadow-sm' : ''
        }`}
        style={
          scrollMode === 'continuous'
            ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)' }
            : { color: 'var(--color-text-muted)' }
        }
        title="Continuous scroll"
      >
        Scroll
      </button>
      <button
        onClick={() => onScrollModeChange('paginated')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
          scrollMode === 'paginated' ? 'shadow-sm' : ''
        }`}
        style={
          scrollMode === 'paginated'
            ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)' }
            : { color: 'var(--color-text-muted)' }
        }
        title="Pagination"
      >
        Pages
      </button>
    </div>
  )
}
