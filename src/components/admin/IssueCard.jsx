import { useState } from 'react'
import { getImageUrl } from '../../lib/storage'
import { getIssuesForItem } from '../../lib/issueDetectors'

/**
 * Card displaying a catalog item with data quality issues
 * Matches mockup: cover (60x60), content area, edit button
 */
export default function IssueCard({ item, onEdit }) {
  const [imageError, setImageError] = useState(false)
  const issues = getIssuesForItem(item)

  // Get artist/author display
  const creators = item.type === 'CD'
    ? (item.artists || []).join(', ')
    : (item.authors || []).join(', ')

  // Get badge style based on issue severity
  const getBadgeStyle = (issue) => {
    // "missing" severity - orange/warning
    if (issue.color === 'red' || issue.color === 'orange') {
      return {
        backgroundColor: 'var(--color-highlight-light)',
        color: 'var(--color-highlight)'
      }
    }
    // "warning" severity - info/blue tint
    if (issue.color === 'yellow' || issue.color === 'amber') {
      return {
        backgroundColor: 'var(--color-info-light)',
        color: 'var(--color-info)'
      }
    }
    // "info" severity - accent/olive
    return {
      backgroundColor: 'var(--color-accent-light)',
      color: 'var(--color-accent)'
    }
  }

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-sm"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Cover Image */}
      <div
        className="flex-shrink-0 w-[60px] h-[60px] rounded overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-neutral-light)' }}
      >
        {!imageError && item.image ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-6 h-6"
            style={{ color: 'var(--color-text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {item.type === 'CD' ? (
              <>
                <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
              </>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            )}
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Title + ID */}
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--color-text)' }}
          >
            {item.title}
          </h3>
          <span
            className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: 'var(--color-neutral-light)',
              color: 'var(--color-text-muted)'
            }}
          >
            {item.id}
          </span>
        </div>

        {/* Artist/Author */}
        {creators && (
          <p
            className="text-sm mb-2 truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {creators}
          </p>
        )}

        {/* Issue Badges */}
        <div className="flex flex-wrap gap-1.5">
          {issues.map(issue => (
            <span
              key={issue.type}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={getBadgeStyle(issue)}
            >
              {issue.label}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(item)}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
          backgroundColor: 'var(--color-bg-card)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-hover)'
          e.currentTarget.style.color = 'var(--color-text)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Edit</span>
      </button>
    </div>
  )
}
