/**
 * Tabs for filtering by catalog type (All/Albums/Books)
 * Matches mockup design with underline indicator and inline counts
 */
export default function ReviewTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { key: 'all', label: 'All', count: counts.all || 0 },
    { key: 'CD', label: 'Albums', count: counts.cd || 0 },
    { key: 'Book', label: 'Books', count: counts.book || 0 }
  ]

  return (
    <div
      className="mb-5 flex"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className="relative px-5 py-2.5 font-medium text-sm transition-colors"
          style={{
            color: activeTab === tab.key ? 'var(--color-secondary)' : 'var(--color-text-muted)'
          }}
        >
          {tab.label}
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--color-secondary-light)' : 'var(--color-neutral-light)',
              color: activeTab === tab.key ? 'var(--color-secondary)' : 'var(--color-text-muted)'
            }}
          >
            {tab.count}
          </span>

          {/* Active underline indicator */}
          {activeTab === tab.key && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
