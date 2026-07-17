/**
 * Issue detection utilities for catalog data quality review
 * Defines issue types and detector functions
 */

export const ISSUE_TYPES = {
  missingImage: {
    label: 'Missing Image',
    icon: '🖼️',
    color: 'red',
    detector: (item) => !item.hasValidImage,
    appliesToCD: true,
    appliesToBook: true
  },
  noTracks: {
    label: 'No Tracks',
    icon: '🎵',
    color: 'orange',
    detector: (item) => !item.tracks || item.tracks === 0 || item.tracks === '0',
    appliesToCD: true,
    appliesToBook: false
  },
  missingYear: {
    label: 'Missing Year',
    icon: '📅',
    color: 'yellow',
    detector: (item) => !item.year || item.year.toString().trim() === '',
    appliesToCD: true,
    appliesToBook: true
  },
  noDescription: {
    label: 'No Description',
    icon: '📝',
    color: 'blue',
    detector: (item) => !item.description || item.description.trim().length < 20,
    appliesToCD: true,
    appliesToBook: true
  },
  noGenre: {
    label: 'No Genre',
    icon: '🎭',
    color: 'purple',
    detector: (item) => !item.genre || item.genre.length === 0,
    appliesToCD: true,
    appliesToBook: false
  },
  noLinks: {
    label: 'No Links',
    icon: '🔗',
    color: 'slate',
    detector: (item) => {
      const links = item.links || {}
      return Object.keys(links).length === 0 ||
             Object.values(links).every(v => !v || v.trim() === '')
    },
    appliesToCD: true,
    appliesToBook: true
  }
}

/**
 * Get badge color classes for an issue type
 */
export const BADGE_COLORS = {
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  slate: 'bg-slate-100 text-slate-800'
}

/**
 * Get all issues for a given catalog item
 * @param {Object} item - Catalog item (CD or Book)
 * @returns {Array} Array of issue objects with type, label, icon, and color
 */
export function getIssuesForItem(item) {
  const issues = []

  for (const [key, config] of Object.entries(ISSUE_TYPES)) {
    // Check if issue type applies to this item type
    const applies = (item.type === 'CD' && config.appliesToCD) ||
                    (item.type === 'Book' && config.appliesToBook)

    if (applies && config.detector(item)) {
      issues.push({
        type: key,
        label: config.label,
        icon: config.icon,
        color: config.color
      })
    }
  }

  return issues
}

/**
 * Calculate issue counts for a collection of items
 * @param {Array} items - Array of catalog items
 * @returns {Object} Object with counts by issue type and catalog type
 */
export function calculateIssueCounts(items) {
  const counts = {}

  for (const [key, config] of Object.entries(ISSUE_TYPES)) {
    const cdItems = items.filter(item => item.type === 'CD')
    const bookItems = items.filter(item => item.type === 'Book')

    counts[key] = {
      cd: config.appliesToCD ? cdItems.filter(config.detector).length : 0,
      book: config.appliesToBook ? bookItems.filter(config.detector).length : 0,
      get total() {
        return this.cd + this.book
      }
    }
  }

  return counts
}

/**
 * Get detector function for an issue type
 * @param {string} issueType - Issue type key
 * @returns {Function} Detector function
 */
export function getDetectorForIssue(issueType) {
  return ISSUE_TYPES[issueType]?.detector || (() => false)
}
