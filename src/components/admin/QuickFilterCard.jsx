import { ISSUE_TYPES } from '../../lib/issueDetectors'

/**
 * Quick filter card for displaying an issue type with count
 * Matches mockup: label on left, count on right
 */
export default function QuickFilterCard({ issueType, count, active, onClick }) {
  const config = ISSUE_TYPES[issueType]

  if (!config) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-150 hover:shadow-sm text-left"
      style={{
        borderColor: active ? 'var(--color-secondary)' : 'var(--color-border)',
        backgroundColor: active ? 'var(--color-secondary-light)' : 'var(--color-bg-card)',
      }}
    >
      <span
        className="text-sm"
        style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
      >
        {config.label}
      </span>
      <span
        className="text-lg font-bold"
        style={{ color: active ? 'var(--color-secondary)' : 'var(--color-text)' }}
      >
        {count}
      </span>
    </button>
  )
}
