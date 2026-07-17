import { useState } from 'react'
import { getImageUrl } from '../lib/storage'

export default function BookListItem({ book, onClick, onFilterClick }) {
  const [imageError, setImageError] = useState(false)

  const handleAuthorClick = (e, author) => {
    e.stopPropagation()
    onFilterClick('author', author)
  }

  const handleSubjectClick = (e, subject) => {
    e.stopPropagation()
    onFilterClick('subject', subject)
  }

  const handleCategoryClick = (e, category) => {
    e.stopPropagation()
    onFilterClick('category', category)
  }

  return (
    <div
      onClick={onClick}
      className="list-item-row"
    >
      {/* Cover Image */}
      <div className="list-cover-md">
        {!imageError && book.image ? (
          <img
            src={getImageUrl(book.image)}
            alt={book.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-400">
            <span className="text-2xl">📚</span>
          </div>
        )}
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
        {/* Title & Metadata (4 cols on desktop) */}
        <div className="md:col-span-4 min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-slate-900 truncate">
            {book.title}
          </h3>
          {/* Authors on mobile, Publisher on desktop */}
          <p className="text-xs text-slate-500 truncate md:hidden">
            {book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
          </p>
          <p className="text-xs text-slate-500 truncate hidden md:block">{book.publisher}</p>
          <p className="text-xs text-slate-400">
            {book.pageCount && `${book.pageCount} pages`}
            {book.pageCount && book.format && ' • '}
            {book.format}
          </p>
        </div>

        {/* Authors (3 cols on desktop, hidden on mobile) */}
        <div className="hidden md:block md:col-span-3 min-w-0">
          <div className="text-sm text-slate-600 truncate">
            {book.authors && book.authors.length > 0 ? (
              book.authors.map((author, idx) => (
                <span key={idx}>
                  <button
                    onClick={(e) => handleAuthorClick(e, author)}
                    className="hover:text-irish-green hover:underline"
                  >
                    {author}
                  </button>
                  {idx < book.authors.length - 1 && ', '}
                </span>
              ))
            ) : (
              <span>Unknown Author</span>
            )}
          </div>
        </div>

        {/* Year (1 col on desktop, hidden on tablet/mobile) */}
        <div className="hidden lg:block lg:col-span-1 text-sm text-slate-600">
          {book.year}
        </div>

        {/* Tags (3 cols on desktop) */}
        <div className="md:col-span-3 flex flex-wrap gap-1">
          {book.subjects && book.subjects.slice(0, 2).map(subject => (
            <button
              key={subject}
              onClick={(e) => handleSubjectClick(e, subject)}
              className="badge bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
            >
              {subject}
            </button>
          ))}
          {book.categories && book.categories.slice(0, 1).map(category => (
            <button
              key={category}
              onClick={(e) => handleCategoryClick(e, category)}
              className="badge bg-purple-100 text-purple-700 text-xs hover:bg-purple-200"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Links (1 col on desktop) */}
        <div className="md:col-span-1 flex gap-2 justify-end">
          {book.links?.goodreads && (
            <a
              href={book.links.goodreads}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-amber-600 hover:text-amber-700"
              title="View on Goodreads"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.24 17.34c-1.17.78-2.52 1.17-4.05 1.17-1.68 0-3.075-.495-4.185-1.485-1.11-.99-1.665-2.295-1.665-3.915 0-1.71.555-3.06 1.665-4.05 1.11-.99 2.505-1.485 4.185-1.485 1.53 0 2.88.39 4.05 1.17l-.84 1.35c-.99-.63-2.04-.945-3.15-.945-1.23 0-2.235.375-3.015 1.125-.78.75-1.17 1.77-1.17 3.06 0 1.26.39 2.265 1.17 3.015.78.75 1.785 1.125 3.015 1.125.81 0 1.53-.15 2.16-.45.63-.3 1.11-.72 1.44-1.26.33-.54.495-1.14.495-1.8v-.45h-4.05v-1.65h5.97v.9c0 1.14-.225 2.13-.675 2.97-.45.84-1.095 1.5-1.935 1.98z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
