/**
 * Shared utilities for catalog items (CDs and Books)
 */

/**
 * Format creators (artists/authors) into a readable string
 * Works for both music artists and book authors
 * @param {string[]} creators - Array of artist/author names
 * @returns {string} Formatted creator names
 */
export function formatCreators(creators) {
  if (!creators || creators.length === 0) return 'Unknown';
  if (creators.length === 1) return creators[0];
  if (creators.length === 2) return creators.join(' & ');
  return creators.slice(0, -1).join(', ') + ' & ' + creators[creators.length - 1];
}

/**
 * Get filter configuration based on catalog type
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {object} Filter configuration with specific filters and sort options
 */
export function getFilterConfig(catalogType) {
  if (catalogType === 'CD') {
    return {
      specificFilters: ['genre', 'artist', 'instrument', 'track'],
      sortOptions: [
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'year', label: 'Year (Oldest)' },
        { value: 'year-desc', label: 'Year (Newest)' },
        { value: 'artist', label: 'Artist (A-Z)' }
      ]
    };
  } else if (catalogType === 'Book') {
    return {
      specificFilters: ['subject', 'category', 'author', 'format'],
      sortOptions: [
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'year', label: 'Year (Oldest)' },
        { value: 'year-desc', label: 'Year (Newest)' },
        { value: 'author', label: 'Author (A-Z)' },
        { value: 'pageCount', label: 'Page Count (High to Low)' }
      ]
    };
  }

  // Default fallback
  return {
    specificFilters: [],
    sortOptions: [{ value: 'title', label: 'Title (A-Z)' }]
  };
}

/**
 * Get the display name for creator field based on catalog type
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {string} 'Artists' or 'Authors'
 */
export function getCreatorFieldName(catalogType) {
  return catalogType === 'CD' ? 'Artists' : 'Authors';
}

/**
 * Get the creator array from an item based on catalog type
 * @param {object} item - Catalog item (CD or Book)
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {string[]} Array of creators
 */
export function getCreators(item, catalogType) {
  return catalogType === 'CD' ? item.artists : item.authors;
}

/**
 * Get search keywords for an item based on catalog type
 * Used for building comprehensive search index
 * @param {object} item - Catalog item
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {string[]} Array of searchable keywords
 */
export function getSearchKeywords(item, catalogType) {
  const keywords = [
    item.title,
    ...getCreators(item, catalogType),
    item.description || '',
    item.publisher || ''
  ];

  if (catalogType === 'CD') {
    // Add CD-specific searchables
    if (item.trackList) {
      keywords.push(...item.trackList);
    }
    if (item.instruments) {
      keywords.push(...item.instruments);
    }
    if (item.genre) {
      keywords.push(...item.genre);
    }
  } else {
    // Add Book-specific searchables
    if (item.subjects) {
      keywords.push(...item.subjects);
    }
    if (item.categories) {
      keywords.push(...item.categories);
    }
    if (item.isbn) {
      keywords.push(item.isbn);
    }
  }

  return keywords.filter(Boolean);
}

/**
 * Extract unique filter options from catalog items
 * @param {object[]} items - Array of catalog items
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {object} Object containing arrays of unique values for each filterable field
 */
export function extractFilterOptions(items, catalogType) {
  const options = {
    years: [...new Set(items.map(item => item.year).filter(Boolean))].sort((a, b) => b.localeCompare(a)),
    publishers: [...new Set(items.map(item => item.publisher).filter(Boolean))].sort()
  };

  if (catalogType === 'CD') {
    options.genres = [...new Set(items.flatMap(item => item.genre || []))].sort();
    options.instruments = [...new Set(items.flatMap(item => item.instruments || []))].sort();
  } else {
    options.subjects = [...new Set(items.flatMap(item => item.subjects || []))].sort();
    options.categories = [...new Set(items.flatMap(item => item.categories || []))].sort();
    options.formats = [...new Set(items.map(item => item.format).filter(Boolean))].sort();
  }

  return options;
}

/**
 * Apply filters and search to catalog items
 * @param {object[]} items - Array of catalog items
 * @param {string} searchTerm - Search string
 * @param {object} filters - Filter object with properties like year, genre, etc.
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {object[]} Filtered and sorted items
 */
export function filterItems(items, searchTerm, filters, catalogType) {
  let results = [...items];

  // Search filter
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    results = results.filter(item => {
      const keywords = getSearchKeywords(item, catalogType);
      return keywords.some(keyword => keyword && keyword.toLowerCase().includes(search));
    });
  }

  // Common filters
  if (filters.year) {
    results = results.filter(item => item.year === filters.year);
  }
  if (filters.publisher) {
    results = results.filter(item => item.publisher === filters.publisher);
  }

  // Type-specific filters
  if (catalogType === 'CD') {
    if (filters.genre) {
      results = results.filter(item => item.genre && item.genre.includes(filters.genre));
    }
    if (filters.artist) {
      results = results.filter(item =>
        item.artists && item.artists.some(artist => artist.toLowerCase() === filters.artist.toLowerCase())
      );
    }
    if (filters.instrument) {
      results = results.filter(item => item.instruments && item.instruments.includes(filters.instrument));
    }
    if (filters.track) {
      results = results.filter(item => item.trackList && item.trackList.includes(filters.track));
    }
  } else {
    // Book filters
    if (filters.subject) {
      results = results.filter(item => item.subjects && item.subjects.includes(filters.subject));
    }
    if (filters.category) {
      results = results.filter(item => item.categories && item.categories.includes(filters.category));
    }
    if (filters.author) {
      results = results.filter(item =>
        item.authors && item.authors.some(author => author.toLowerCase() === filters.author.toLowerCase())
      );
    }
    if (filters.format) {
      results = results.filter(item => item.format === filters.format);
    }
  }

  // Sorting
  const sortKey = filters.sortBy || 'title';
  results.sort((a, b) => {
    switch (sortKey) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'year':
        return (a.year || '9999').localeCompare(b.year || '9999');
      case 'year-desc':
        return (b.year || '0').localeCompare(a.year || '0');
      case 'artist':
      case 'author':
        const creatorA = getCreators(a, catalogType)[0] || '';
        const creatorB = getCreators(b, catalogType)[0] || '';
        return creatorA.localeCompare(creatorB);
      case 'pageCount':
        return (b.pageCount || 0) - (a.pageCount || 0);
      default:
        return 0;
    }
  });

  return results;
}

/**
 * Check if an item has external links
 * @param {object} item - Catalog item
 * @returns {boolean} True if item has any links
 */
export function hasLinks(item) {
  return item.links && Object.keys(item.links).length > 0;
}

/**
 * Get image fallback icon based on catalog type
 * @param {string} catalogType - 'CD' or 'Book'
 * @returns {string} Emoji icon
 */
export function getImageFallbackIcon(catalogType) {
  return catalogType === 'CD' ? '💿' : '📚';
}

/**
 * Format year for display
 * @param {string} year - Year value
 * @returns {string} Formatted year
 */
export function formatYear(year) {
  if (!year || year === 'Unknown') return 'Unknown Year';
  return year;
}

/**
 * Get metadata label for catalog type
 * @param {string} catalogType - 'CD' or 'Book'
 * @param {string} field - Field name (e.g., 'runtime', 'pageCount')
 * @returns {string} Human-readable label
 */
export function getMetadataLabel(catalogType, field) {
  const labels = {
    // Common
    year: 'Year',
    publisher: 'Publisher',
    // CD-specific
    runtime: 'Runtime',
    tracks: 'Tracks',
    discs: 'Discs',
    catalogNumber: 'Catalog #',
    instruments: 'Instruments',
    genre: 'Genre',
    // Book-specific
    isbn: 'ISBN',
    pageCount: 'Pages',
    edition: 'Edition',
    format: 'Format',
    subjects: 'Subjects',
    categories: 'Categories',
    tuneCount: 'Tune Count',
    contentType: 'Content Type'
  };
  return labels[field] || field;
}
